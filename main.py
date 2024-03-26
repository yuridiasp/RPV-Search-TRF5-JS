import flet as ft
from controller.controller import Controller
import re

class Searcher_controll (ft.UserControl):

    def build(self):
        wdt = 300
        self.output_text = ft.Text(visible=False)
        self.output_export_text = ft.Text(visible=False)

        self.submit_btn = ft.ElevatedButton(text="Buscar", on_click=self.button_clicked, width=600)
        self.export_btn = ft.ElevatedButton(text="Exportar Resultados", on_click=self.exportar_resultados, visible=False, width=600)

        self.label_title = ft.Text("Dados para Pesquisa", theme_style=ft.TextThemeStyle.TITLE_LARGE)
        self.label_datas_title = ft.Text("Data de Autuação:", theme_style=ft.TextThemeStyle.TITLE_SMALL)
        self.label_oab = ft.Text("OAB:", theme_style=ft.TextThemeStyle.TITLE_SMALL)
        self.label_tipo = ft.Text("Tipo:", theme_style=ft.TextThemeStyle.TITLE_SMALL)

        self.data_de = ft.TextField(label="De: (XX/XX/XXXX)", width=wdt, autofocus=True)
        self.data_ate = ft.TextField(label="Até: (XX/XX/XXXX)", width=wdt)

        self.oab_dropdown = ft.Dropdown(
            width=wdt,
            options=[
                ft.dropdown.Option("353A"),
                ft.dropdown.Option("353"),
            ],
        )

        self.tipo_dropdown = ft.Dropdown(
            width=wdt,
            options=[
                ft.dropdown.Option("RPV"),
                ft.dropdown.Option("Precatório"),
            ],
        )
        
        self.progress_info = ft.Text(theme_style=ft.TextThemeStyle.TITLE_MEDIUM)

        self.progress_bar = ft.Row([
            ft.Column([
                ft.Text("Realizando busca...", theme_style=ft.TextThemeStyle.HEADLINE_SMALL),
                self.progress_info,
                ft.ProgressBar(width=600)
            ])],
            visible=False)

        return ft.Column(
            controls=[
                ft.Row(controls=[self.label_title]),
                ft.Row(controls=[self.label_datas_title]),
                ft.Row(controls=[self.data_de, self.data_ate]),
                ft.Row(controls=[
                        ft.Column([self.label_oab, self.oab_dropdown]),
                        ft.Column([self.label_tipo, self.tipo_dropdown])],
                    alignment=ft.MainAxisAlignment.CENTER),
                self.submit_btn,
                self.progress_bar,
                self.output_text,
                self.export_btn,
                self.output_export_text])
    
    def desabilitar_inputs(self):
        self.data_de.disabled = True
        self.data_ate.disabled = True
        self.oab_dropdown.disabled = True
        self.tipo_dropdown.disabled = True
        self.submit_btn.disabled = True
        self.export_btn.disabled = True
        self.output_export_text.disabled = True
        self.update()

    def habilitar_inputs(self):
        self.data_de.disabled = False
        self.data_ate.disabled = False
        self.oab_dropdown.disabled = False
        self.tipo_dropdown.disabled = False
        self.submit_btn.disabled = False
        self.export_btn.disabled = False
        self.output_export_text.disabled = False
        self.update()

    def atualizar_progress(self, atual, final):
        self.progress_info.value = f"{atual} de {final} páginas."
        self.progress_info.update()

    def show_progress_bar(self):
        self.progress_bar.visible = True
        self.update()

    def hidde_progress_bar(self):
        self.progress_bar.visible = False
        self.update()
    
    def show_dialog(self, message):
        dlg = ft.AlertDialog(title=ft.Text(message))
        self.page.dialog = dlg
        dlg.open = True
        self.page.update()

    def exportar_resultados(self, e):
        try:
            result = app_controller.export(self.path)
            if result:
                mensagem = "Planilha do excel gerada com sucesso!"
            else:
                mensagem = "Houve um erro ao tentar gerar planilha."
            self.output_export_text.visible = True
            self.update()
        except AttributeError as error:
            print(error)
            mensagem = "Selecione a pasta que deseja salvar os resultados!"
        finally:
            self.show_dialog(message=mensagem)
    
    def validar_formulario(self, dados):
        regex = r'\d\d/\d\d/\d\d\d\d'
        de_is_correct = re.fullmatch(pattern=regex, string=dados['de'])
        ate_is_correct = re.fullmatch(pattern=regex, string=dados['ate'])
        
        if not de_is_correct or not ate_is_correct:
            return False
        return True
    
    def button_clicked(self, e):
        self.output_export_text.visible = False
        self.export_btn.visible = False
        self.output_text.visible = False
        dados = {
            'oab': self.oab_dropdown.value,
            'tipo': self.tipo_dropdown.value,
            'de': self.data_de.value,
            'ate': self.data_ate.value
        }

        validation = self.validar_formulario(dados)

        if validation:
            self.show_progress_bar()
            self.desabilitar_inputs()
            
            resposta = app_controller.search(dados)

            self.hidde_progress_bar()
            self.habilitar_inputs()

            if resposta['resultado']:
                mensagem = f"Busca realizada com sucesso! Encontrado um total de {resposta['contagem']} resultados."
                self.export_btn.visible = True
            else:
                mensagem = "Não foram encontrados registros."
            self.output_text.value = mensagem
            self.output_text.visible = True
            self.update()
        else:
            self.show_dialog("As datas informadas devem estar no formato DD/MM/AAAA.")

    def init_default_values(self):
        self.oab_dropdown.value = "353A"
        self.tipo_dropdown.value = "RPV"
        self.update()

    def init_test(self):
        self.data_de.value = "01/01/2023"
        self.data_ate.value = "20/03/2024"
        self.init_values()

def main(page: ft.Page):
    def get_directory_result(e: ft.FilePickerResultEvent):
        text_directory.value = e.path
        text_directory.update()
        searcher_controll.path = e.path

    page.title = "RPV / Precatório Searcher TRF5"
    page.window_maximized = True

    img = ft.Image(
        src="assets/icon.png",
        width=47.27,
        height=50,
        fit=ft.ImageFit.CONTAIN,
    )

    get_directory_dialog = ft.FilePicker(on_result=get_directory_result)
    get_directory_dialog_btn = ft.ElevatedButton("Onde deseja salvar?", on_click=lambda _: get_directory_dialog.get_directory_path())
    text_directory = ft.Text()

    page.overlay.extend([get_directory_dialog])

    page.add(
        ft.Column(
            controls=[
                ft.Column([ft.Text("Por: Yuri Dias Pereira Gomes", theme_style=ft.TextThemeStyle.BODY_SMALL),
                           ft.Text("V1.0", theme_style=ft.TextThemeStyle.BODY_SMALL), ft.Row([img, ft.Text("RPV / Precatório Searcher TRF5", theme_style=ft.TextThemeStyle.TITLE_SMALL)], alignment=ft.MainAxisAlignment.CENTER)]),
                ft.Row(
                    [get_directory_dialog_btn, text_directory],
                    alignment=ft.MainAxisAlignment.CENTER,
                    vertical_alignment=ft.MainAxisAlignment.CENTER
                ),
                ft.Row([
                    searcher_controll
                    ],
                    alignment=ft.MainAxisAlignment.CENTER
                )
            ],
            spacing=50,
            alignment=ft.MainAxisAlignment.CENTER,
            horizontal_alignment=ft.MainAxisAlignment.CENTER,
        ))

    searcher_controll.init_default_values()

searcher_controll = Searcher_controll()

app_controller = Controller(searcher_controll)

ft.app(target=main)