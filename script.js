// ========================================
// FLANTCHESKO NOTAS™
// ========================================


// ========================================
// DADOS
// ========================================

let notas =
    JSON.parse(
        localStorage.getItem(
            "flantcheskoNotas"
        )
    ) || [];


let notasPrivadas =
    JSON.parse(
        localStorage.getItem(
            "flantcheskoNotasPrivadas"
        )
    ) || [];


let lixeira =
    JSON.parse(
        localStorage.getItem(
            "flantcheskoLixeira"
        )
    ) || [];


let categorias =
    JSON.parse(
        localStorage.getItem(
            "flantcheskoCategorias"
        )
    ) || ["Geral"];


let notaAtual = null;

let notaPrivadaAtual = null;

let pastaDesbloqueada = false;


// ========================================
// ELEMENTOS
// ========================================

const listaNotas =
    document.getElementById(
        "listaNotas"
    );

const listaNotasPrivadas =
    document.getElementById(
        "listaNotasPrivadas"
    );

const editor =
    document.getElementById(
        "editor"
    );

const titulo =
    document.getElementById(
        "titulo"
    );

const texto =
    document.getElementById(
        "texto"
    );

const pesquisa =
    document.getElementById(
        "pesquisa"
    );

const categoriaNota =
    document.getElementById(
        "categoriaNota"
    );

const categoriaFiltro =
    document.getElementById(
        "categoriaFiltro"
    );

const ordenacao =
    document.getElementById(
        "ordenacao"
    );

const status =
    document.getElementById(
        "status"
    );

const tema =
    document.getElementById(
        "tema"
    );


// ========================================
// SALVAR
// ========================================

function salvarTudo() {

    localStorage.setItem(
        "flantcheskoNotas",
        JSON.stringify(notas)
    );

    localStorage.setItem(
        "flantcheskoNotasPrivadas",
        JSON.stringify(
            notasPrivadas
        )
    );

    localStorage.setItem(
        "flantcheskoLixeira",
        JSON.stringify(
            lixeira
        )
    );

    localStorage.setItem(
        "flantcheskoCategorias",
        JSON.stringify(
            categorias
        )
    );
}


// ========================================
// TEMA
// ========================================

let temaEscuro =
    localStorage.getItem(
        "flantcheskoTema"
    ) === "escuro";


aplicarTema();


tema.onclick = () => {

    temaEscuro = !temaEscuro;

    localStorage.setItem(
        "flantcheskoTema",
        temaEscuro
            ? "escuro"
            : "claro"
    );

    aplicarTema();
};


function aplicarTema() {

    if (temaEscuro) {

        document.body.classList.add(
            "escuro"
        );

        tema.textContent = "☀️";

    } else {

        document.body.classList.remove(
            "escuro"
        );

        tema.textContent = "🌙";
    }
}


// ========================================
// CATEGORIAS
// ========================================

function atualizarCategorias() {

    categoriaNota.innerHTML = "";


    categorias.forEach(
        categoria => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                categoria;

            option.textContent =
                categoria;

            categoriaNota.appendChild(
                option
            );
        }
    );


    categoriaFiltro.innerHTML =
        `<option value="todas">
            Todas as categorias
        </option>`;


    categorias.forEach(
        categoria => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                categoria;

            option.textContent =
                categoria;

            categoriaFiltro.appendChild(
                option
            );
        }
    );
}


// ========================================
// MOSTRAR NOTAS
// ========================================

function mostrarNotas() {

    let resultado =
        [...notas];


    const busca =
        pesquisa.value
            .toLowerCase()
            .trim();


    const filtro =
        categoriaFiltro.value;


    const ordem =
        ordenacao.value;


    if (busca) {

        resultado =
            resultado.filter(
                nota =>

                    nota.titulo
                        .toLowerCase()
                        .includes(busca)

                    ||

                    nota.texto
                        .toLowerCase()
                        .includes(busca)
            );
    }


    if (filtro !== "todas") {

        resultado =
            resultado.filter(
                nota =>
                    nota.categoria ===
                    filtro
            );
    }


    if (ordem === "editada") {

        resultado.sort(
            (a, b) =>
                b.editada - a.editada
        );

    } else if (ordem === "criada") {

        resultado.sort(
            (a, b) =>
                b.criada - a.criada
        );

    } else if (ordem === "titulo") {

        resultado.sort(
            (a, b) =>
                (
                    a.titulo ||
                    "Sem título"
                ).localeCompare(
                    b.titulo ||
                    "Sem título"
                )
        );

    } else if (ordem === "fixadas") {

        resultado.sort(
            (a, b) =>
                Number(b.fixada) -
                Number(a.fixada)
        );
    }


    listaNotas.innerHTML = "";


    if (
        resultado.length === 0
    ) {

        listaNotas.innerHTML = `
            <div class="vazio">

                <h2>
                    📭 Nenhuma nota
                </h2>

                <p>
                    Crie uma nova nota para começar.
                </p>

            </div>
        `;

        return;
    }


    resultado.forEach(
        nota => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "nota " +
                (nota.cor || "padrao");


            if (nota.fixada) {

                div.classList.add(
                    "fixada"
                );
            }


            div.innerHTML = `

                <div class="nota-topo">

                    <h2>
                        ${escapar(
                            nota.titulo ||
                            "Sem título"
                        )}
                    </h2>

                    <span>
                        ${
                            nota.fixada
                                ? "📌"
                                : ""
                        }
                    </span>

                </div>

                <p>
                    ${escapar(
                        nota.texto ||
                        "Nota vazia"
                    )}
                </p>

                <div class="nota-info">

                    <span class="tag">
                        ${escapar(
                            nota.categoria ||
                            "Geral"
                        )}
                    </span>

                    <span>
                        ${nota.data}
                    </span>

                </div>
            `;


            div.onclick = () => {

                abrirNota(
                    nota.id
                );
            };


            listaNotas.appendChild(
                div
            );
        }
    );
}


// ========================================
// NOVA NOTA
// ========================================

document.getElementById(
    "novaNota"
).onclick = () => {

    const agora =
        Date.now();


    const nova = {

        id: agora,

        titulo: "",

        texto: "",

        categoria: "Geral",

        cor: "padrao",

        fixada: false,

        criada: agora,

        editada: agora,

        data: dataAtual()
    };


    notas.unshift(
        nova
    );


    salvarTudo();

    abrirNota(
        nova.id
    );
};


// ========================================
// ABRIR NOTA
// ========================================

function abrirNota(id) {

    notaAtual =
        notas.find(
            nota =>
                nota.id === id
        );


    notaPrivadaAtual = null;


    if (!notaAtual) return;


    titulo.value =
        notaAtual.titulo;


    texto.value =
        notaAtual.texto;


    categoriaNota.value =
        notaAtual.categoria ||
        "Geral";


    atualizarCorSelecionada();

    atualizarBotaoFixar();


    editor.classList.remove(
        "escondido"
    );


    titulo.focus();
}


// ========================================
// SALVAR EDIÇÃO
// ========================================

titulo.addEventListener(
    "input",
    salvarEdicao
);


texto.addEventListener(
    "input",
    salvarEdicao
);


function salvarEdicao() {

    if (!notaAtual) return;


    notaAtual.titulo =
        titulo.value;


    notaAtual.texto =
        texto.value;


    notaAtual.categoria =
        categoriaNota.value;


    notaAtual.editada =
        Date.now();


    notaAtual.data =
        dataAtual();


    salvarTudo();


    status.textContent =
        "Salvando...";


    clearTimeout(
        window.timerSalvar
    );


    window.timerSalvar =
        setTimeout(
            () => {

                status.textContent =
                    "Salvo ✓";

            },
            300
        );
}


// ========================================
// CATEGORIA
// ========================================

categoriaNota.addEventListener(
    "change",
    () => {

        if (!notaAtual)
            return;


        notaAtual.categoria =
            categoriaNota.value;


        notaAtual.editada =
            Date.now();


        salvarTudo();

        mostrarNotas();
    }
);


// ========================================
// VOLTAR
// ========================================

document.getElementById(
    "voltar"
).onclick = () => {

    editor.classList.add(
        "escondido"
    );

    notaAtual = null;

    notaPrivadaAtual = null;

    mostrarNotas();
};


// ========================================
// FIXAR
// ========================================

document.getElementById(
    "fixar"
).onclick = () => {

    if (!notaAtual)
        return;


    notaAtual.fixada =
        !notaAtual.fixada;


    notaAtual.editada =
        Date.now();


    salvarTudo();


    atualizarBotaoFixar();

    mostrarNotas();
};


function atualizarBotaoFixar() {

    const botao =
        document.getElementById(
            "fixar"
        );


    if (!notaAtual)
        return;


    botao.textContent =
        notaAtual.fixada
            ? "📌"
            : "📍";
}


// ========================================
// CORES
// ========================================

document
    .querySelectorAll(".cor")
    .forEach(
        botao => {

            botao.onclick = () => {

                if (!notaAtual)
                    return;


                notaAtual.cor =
                    botao.dataset.cor;


                notaAtual.editada =
                    Date.now();


                salvarTudo();


                atualizarCorSelecionada();

                mostrarNotas();
            };
        }
    );


function atualizarCorSelecionada() {

    document
        .querySelectorAll(".cor")
        .forEach(
            botao => {

                botao.classList.remove(
                    "ativa"
                );


                if (
                    notaAtual &&
                    botao.dataset.cor ===
                    notaAtual.cor
                ) {

                    botao.classList.add(
                        "ativa"
                    );
                }
            }
        );
}


// ========================================
// EXCLUIR NOTA
// ========================================

document.getElementById(
    "excluir"
).onclick = () => {

    if (!notaAtual)
        return;


    if (notaPrivadaAtual) {

        excluirNotaPrivada();

        return;
    }


    const confirmar =
        confirm(
            "Mover esta nota para a lixeira?"
        );


    if (!confirmar)
        return;


    const index =
        notas.findIndex(
            nota =>
                nota.id ===
                notaAtual.id
        );


    if (index === -1)
        return;


    const removida =
        notas.splice(
            index,
            1
        )[0];


    removida.excluida =
        Date.now();


    lixeira.unshift(
        removida
    );


    salvarTudo();


    fecharEditor();

    mostrarNotas();
};


// ========================================
// FECHAR EDITOR
// ========================================

function fecharEditor() {

    editor.classList.add(
        "escondido"
    );

    notaAtual = null;

    notaPrivadaAtual = null;
}


// ========================================
// PESQUISA
// ========================================

pesquisa.addEventListener(
    "input",
    mostrarNotas
);


categoriaFiltro.addEventListener(
    "change",
    mostrarNotas
);


ordenacao.addEventListener(
    "change",
    mostrarNotas
);


// ========================================
// COPIAR
// ========================================

document.getElementById(
    "copiar"
).onclick = async () => {

    const conteudo =
        `${titulo.value}\n\n${texto.value}`;


    try {

        await navigator.clipboard.writeText(
            conteudo
        );


        status.textContent =
            "Copiado ✓";


    } catch {

        alert(
            "Não foi possível copiar."
        );
    }
};


// ========================================
// EXPORTAR
// ========================================

document.getElementById(
    "exportar"
).onclick = () => {

    const conteudo =
        `${titulo.value || "Sem título"}\n\n${texto.value}`;


    const arquivo =
        new Blob(
            [conteudo],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            arquivo
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;


    link.download =
        (
            titulo.value ||
            "nota"
        ) + ".txt";


    link.click();


    URL.revokeObjectURL(
        url
    );
};


// ========================================
// CONFIGURAÇÕES
// ========================================

const configuracoesTela =
    document.getElementById(
        "configuracoesTela"
    );


document.getElementById(
    "configuracoes"
).onclick = () => {

    atualizarQuantidadeLixeira();


    configuracoesTela.classList.remove(
        "escondido"
    );
};


document.getElementById(
    "fecharConfig"
).onclick = () => {

    configuracoesTela.classList.add(
        "escondido"
    );
};


// ========================================
// PASTA TRANCADA
// ========================================

document.getElementById(
    "abrirPasta"
).onclick = () => {

    const senha =
        localStorage.getItem(
            "flantcheskoSenhaPasta"
        );


    if (!senha) {

        configurarSenhaPasta();

        return;
    }


    abrirTelaSenhaPasta();
};


// ========================================
// CONFIGURAR SENHA DA PASTA
// ========================================

document.getElementById(
    "senhaPastaBotao"
).onclick = () => {

    configurarSenhaPasta();
};


function configurarSenhaPasta() {

    const senhaAtual =
        localStorage.getItem(
            "flantcheskoSenhaPasta"
        );


    if (senhaAtual) {

        const verificar =
            prompt(
                "Digite a senha atual:"
            );


        if (
            verificar !==
            senhaAtual
        ) {

            alert(
                "Senha incorreta."
            );

            return;
        }
    }


    const novaSenha =
        prompt(
            senhaAtual
                ? "Digite a nova senha:"
                : "Crie uma senha para a Pasta Trancada:"
        );


    if (!novaSenha)
        return;


    if (
        novaSenha.length < 4
    ) {

        alert(
            "A senha precisa ter pelo menos 4 caracteres."
        );

        return;
    }


    localStorage.setItem(
        "flantcheskoSenhaPasta",
        novaSenha
    );


    alert(
        "Senha da Pasta Trancada configurada! 🔒"
    );
}


// ========================================
// ABRIR SENHA DA PASTA
// ========================================

const senhaPasta =
    document.getElementById(
        "senhaPasta"
    );


function abrirTelaSenhaPasta() {

    document.getElementById(
        "senhaPastaInput"
    ).value = "";


    document.getElementById(
        "erroPasta"
    ).textContent = "";


    senhaPasta.classList.remove(
        "escondido"
    );
}


document.getElementById(
    "cancelarPasta"
).onclick = () => {

    senhaPasta.classList.add(
        "escondido"
    );
};


document.getElementById(
    "entrarPasta"
).onclick = () => {

    const digitada =
        document.getElementById(
            "senhaPastaInput"
        ).value;


    const senha =
        localStorage.getItem(
            "flantcheskoSenhaPasta"
        );


    if (
        digitada === senha
    ) {

        senhaPasta.classList.add(
            "escondido"
        );


        pastaDesbloqueada = true;


        abrirPasta();
        

    } else {

        document.getElementById(
            "erroPasta"
        ).textContent =
            "Senha incorreta.";
    }
};


// ========================================
// ABRIR PASTA
// ========================================

function abrirPasta() {

    document.getElementById(
        "pastaTrancada"
    ).classList.remove(
        "escondido"
    );


    mostrarNotasPrivadas();
}


// ========================================
// FECHAR PASTA
// ========================================

document.getElementById(
    "fecharPasta"
).onclick = () => {

    document.getElementById(
        "pastaTrancada"
    ).classList.add(
        "escondido"
    );


    pastaDesbloqueada =
        false;
};


// ========================================
// MOSTRAR NOTAS PRIVADAS
// ========================================

function mostrarNotasPrivadas() {

    listaNotasPrivadas.innerHTML =
        "";


    if (
        notasPrivadas.length === 0
    ) {

        listaNotasPrivadas.innerHTML = `

            <div class="vazio">

                <h2>
                    🔒 Pasta vazia
                </h2>

                <p>
                    Crie uma nota privada.
                </p>

            </div>

        `;

        return;
    }


    notasPrivadas.forEach(
        nota => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "nota-privada";


            div.innerHTML = `

                <h3>
                    ${escapar(
                        nota.titulo ||
                        "Sem título"
                    )}
                </h3>

                <p>
                    ${escapar(
                        nota.texto ||
                        "Nota vazia"
                    )}
                </p>

                <small>
                    ${nota.data}
                </small>

            `;


            div.onclick = () => {

                abrirNotaPrivada(
                    nota.id
                );
            };


            listaNotasPrivadas.appendChild(
                div
            );
        }
    );
}


// =================
