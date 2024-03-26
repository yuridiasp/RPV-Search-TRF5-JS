import pandas as pd
import requests
import math
from bs4 import BeautifulSoup

class Searcher:
    tipos = {
        'RPV': 'tiporpv',
        'Precatório': 'tipoprecatorio'
    }
    busca = {
        "uf": "SE",
        "oab": None,
        "de": None,
        "ate": None,
        "tipo": None
    }
    page = None
    pages = 0
    contagem = 0

    def __init__(self, controller, dados):
        self.controller = controller
        self.busca['tipo'] = self.tipos[dados['tipo']]
        self.busca['oab'] = dados['oab']
        self.busca['de'] = dados['de']
        self.busca['ate'] = dados['ate']

    def search(self) -> bool:
        self.link = f"https://cp.trf5.jus.br/processo/rpvprec/rpvPrecOAB/porData/{self.busca['tipo']}/ativos/{self.busca['uf']}000{self.busca['oab']}/{self.busca['de']}/{self.busca['ate']}//"
        site, self.page = self.nextPage()
        self.pages = self.calcular_pages(site)
        data_dict = {
                'Processo': [],
                'Classe': [],
                'Data do Movimento': [],
                'Hora do Movimento': [],
                'Última Movimentação': []
            }
        for i in range(self.pages):
            self.controller.atualizar_progresso(self.page, self.pages)
            data_dict = self.extrair_dados(site, data_dict)
            if i > 0:
                site, self.page = self.nextPage()
        self.df_rpvs = pd.DataFrame.from_dict(data_dict)
        self.contagem = self.df_rpvs.shape[0]

        return True

    def requesitar_dados (self, path):
        index = requests.get(path)
        return  BeautifulSoup(index.text, "html.parser")

    def calcular_pages(self, site):
        span = site.find(class_="texto_consulta")
        quantidade_resultados = int(span.text.split(" ")[1])
        result = math.ceil(quantidade_resultados / 10)
        return result

    def nextPage(self):
        if self.page == None:
            self.page = 0
        else:
            self.page = self.page + 1
        return self.requesitar_dados(self.link + str(self.page)), self.page

    def extrair_dados(self, site, dados):
        tbody = site.find("tbody")
        trs = tbody.find_all('tr')
        for index in range(len(trs)):
            try:
                print(trs[index]['id'])
                tds = trs[index-1].find_all('td')
                dados['Processo'].append(tds[1].text)
                if len(tds) > 2:
                    dados['Classe'].append(tds[2].text)
                dados['Data do Movimento'].append(tds[3].text)
                dados['Hora do Movimento'].append(tds[4].text)
                dados['Última Movimentação'].append(tds[5].text)
            except KeyError:
                pass
        return dados

    def export_to_excel(self, path):
        de_formatado = self.busca['de'].replace("/", "")
        ate_formatado = self.busca['ate'].replace("/", "")
        if self.busca['tipo'] == 'tiporpv':
            tipo = 'RPV'
        else:
            tipo = 'PREC'
        self.df_rpvs.to_excel(f"{path}\\{tipo}-{self.busca['oab']}-{de_formatado}-{ate_formatado}.xlsx")
