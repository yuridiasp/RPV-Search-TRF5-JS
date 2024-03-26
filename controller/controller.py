from model import searcher

class Controller:

    def __init__(self, searcher):
        self.searcher_controll = searcher
    
    def search(self, dados) -> object:
        try:
            self.searcher = searcher.Searcher(dados=dados, controller=self)
            busca = self.searcher.search()
            return {'resultado': busca, 'contagem': self.searcher.contagem}
        except AttributeError as error:
            print(error)
            return {'resultado': False, 'contagem': 0}

    def export(self, path) -> bool:
        try:
            self.searcher.export_to_excel(path)
            return True
        except:
            return False

    def atualizar_progresso(self, atual, final):
        self.searcher_controll.atualizar_progress(atual=atual, final=final)