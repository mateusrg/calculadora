const operadores = ["+", "–", "×", "÷", ","]; /* vírgula tecnicamente não é operador, mas no caso vou considerar
porque é necessário pra parte em que é usada no código */
const textoVisor = document.body.querySelector("#textoVisor");
const botoes = document.body.querySelectorAll("button");
botoes.forEach(botao => botao.addEventListener("click", registraClique.bind(null, botao.innerHTML)));

// Recebendo e interpretando inputs do teclado
const teclasEComandos = [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
                         ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["0", "0"],
                         ["(", "("], [")", ")"], ["+", "+"], ["-", "–"], ["*", "×"],
                         ["x", "×"], ["/", "÷"], [",", ","], [".", ","], ["=", "="],
                         ["c", "C"], ["enter", "="]];
    document.addEventListener("keydown", (pressionado) => {
        let teclaEComando = teclasEComandos.find(teclaEComando => pressionado.key.toLowerCase() === teclaEComando[0]);
        teclaEComando != undefined ? registraClique(teclaEComando[1]) : null;
    });
    
    /**  Função que trata do que fazer quando um botão na calculadora é clicado. Também recebe inputs do teclado
     * indiretamente, o eventListener manda os comando corretos pra ela da mesma forma que um botão.*/
function registraClique(valorBotao) {
    let equacao = separaEquacao();
    if (valorBotao === "C") {
        // Limpa a tela quando o usuário clica no C
        textoVisor.innerHTML = "0";
    } else if (valorBotao === "=") {
        // Executa a equação, evidentemente
        executaEquacao();
    } else if (valorBotao === ")" && equacao.filter(e => e === "(").length <= equacao.filter(e => e === ")").length) {
        // Se a pessoa tentar fechar parênteses antes de abrir, nada acontece. Ou seja, ela não consegue.
        return
    }
    else {
        if (textoVisor.innerHTML === "erro" || textoVisor.innerHTML === "0" && valorBotao != "," && valorBotao != "×" && valorBotao != "÷") {
            /* Exceto em casos específicos por questões lógicas, ele tira o 0 da tela sempre que o usuário digitar algo.
            Por exemplo, se ele apertar 8, deve aparecer 8 na tela, não 08. Por isso o 0 é removido. Isso também se aplica
            pra sinais (+ e -). como não faz sentido ter ×, ÷ e , no início da equação, o 0 é mantido. */
            textoVisor.innerHTML = "";
        } else if ((textoVisor.innerHTML === "+" || textoVisor.innerHTML === "–") && (valorBotao === "×" || valorBotao === "÷")) {
            /* Normalmente uma operação substitui a outra, caso estejam grudadas. Mas como não faz sentido ter × e ÷ no início
            da equação, caso isso ocorra no primeiro caractere, esse if simplesmente zera o visor para evitar erros desnecessários. */
            textoVisor.innerHTML = "0";
        }
        let ultimoCaractere = textoVisor.innerHTML[textoVisor.innerHTML.length - 1];
        if (valorBotao === ")" && ultimoCaractere === "(") {
            /* Se a pessoa tentar fechar parênteses logo após abrir, isso não faz sentido. Então o código entende que o usuário
            se enganou e simplesmente apaga o parênteses recém aberto. */
            textoVisor.innerHTML = textoVisor.innerHTML.slice(0, -1);
            if (textoVisor.innerHTML === "") {textoVisor.innerHTML = "0"};
            // Se isso acontecer no 1º caractere, a linha acima garante que o visor não fique vazio. 
            return
        } else if (valorBotao === "(") {
            /* Se a pessoa tentar abrir parênteses logo após um números ou um ")", é evidente que ela está tentando executar uma
            multiplicação, visto que, quando não há sinal, é isso que se subentende. Então, a calculadora automaticamente acres-
            centa o ×. */
            if (!isNaN(Number(ultimoCaractere)) || ultimoCaractere === ")") {
                textoVisor.innerHTML += "×";
            }
        }
        if (operadores.includes(ultimoCaractere) && operadores.includes(valorBotao)) {
            // Se o usuário estiver tentando digitar dois operadores seguidos, isso é impossível. Então, o primeiro é substituído.
            textoVisor.innerHTML = textoVisor.innerHTML.slice(0, -1);
        } else if (valorBotao === ",") {
            // Verifica se o último número já tem um ".". Se sim, não faz sentido a pessoa tentar colocar outro. 1,5,5 não é um número, por exemplo.
            if (equacao[equacao.length - 1].includes(".")) {
                return
            }
        }
        textoVisor.innerHTML += valorBotao;
    }
}

/** Executa a equação quando o usuário aperta a tecla "=" */
function executaEquacao() {
    // As próximas linhas trocam os símbolos matemáticos que o usuário digita por operadores que o JavaScript entende
    try {
        let equacao = separaEquacao(); // Passe o mouse sobre o "separaEquacao()" para saber o que a função faz
        for (let i = 0; i < equacao.length; i++) {
            switch (equacao[i]) {
                case "–":
                    equacao[i] = "-";
                    break;
                case "×":
                    equacao[i] = "*";
                    break;
                case "÷":
                    equacao[i] = "/";
                    break;
            }
        }

        // Caso hajam mais aberturas que fechamentos de parênteses, o for fecha automaticamente com o número de parênteses necessários
        diferencaParenteses = equacao.filter(e => e === "(").length - equacao.filter(e => e === ")").length
        for (let i = 0; i < diferencaParenteses; i++) {
            equacao.push(")");
        }

        // Junta novamente em uma string a equação que havia sido transformada em um array
        let equacaoJunta = "";
        equacao.forEach(e => equacaoJunta += e);
        resultado = eval(equacaoJunta);
        /* Devido à forma que o JavaScript converte números de decimal para binário, muitas vezes ele acaba distorcendo o valor do número 
        bem levemente, o que acaba se refletindo no valor exibido para o usuário (por exemplo: mesmo que o cálculo dê exatamente 1.3, o JavaScript armazena
        1.299999999999998). Os ifs abaixo buscam minimizar essas distorções. */
        let parteDecimal = resultado.toString().split(".")[1];
        if (parteDecimal === undefined) {parteDecimal = ""}; // Se o número for inteiro, ele esvazia o parteDecimal para não dar erro mais pra frente
        if (parteDecimal.length > 14) { // Essa distorção costuma ocorrer depois de 15 casas decimais. Então, se tiver mais que 14, a calculadora verifica. 
            if (parteDecimal[parteDecimal.length - 2] === "0" && parteDecimal[parteDecimal.length - 3] === "0" && parteDecimal[parteDecimal.length - 4] === "0") {
                // Caso o penúltimo número, o antepenúltimo e o antes do antepenúltimo sejam 0, é provável que aquela distroção tenha ocorrido.
                // Então, as linhas abaixo corta o último número incorreto e todos os zeros anteriores, até achar um valor diferente de zero.
                do {
                    resultado = Number(resultado.toString().slice(0, -1));
                } while (resultado.toString()[resultado.toString().length - 1] === "0");
            }
        }
        if (resultado.toString().length > 8) {
            // A linha de baixo ficou confusa, mas ela só garante que o resultado tenha, no máximo, 7 dígitos (sem contar o ponto)
            resultado = resultado.toFixed(Math.min(resultado.toString().length, 7 - resultado.toString().split(".")[0].length));
        }
        if (isNaN(resultado) || resultado === Infinity) {
            // Caso a pessoa faça um cálculo que o JavaScript não considere como uma exceção, essa parte verifica se o resultado é realmente
            // um número. Ele pega, por exemplo, divisões por 0, que não dão erro mas o resultado fica como "undefined". Essa parte do código
            // torna qualquer valor não numérico "erro".
            // PS: Aparentemente, Infinity é considerado número. Então acrescentei isso na verificação. 
            textoVisor.innerHTML = "erro";
            return
        }
        // Troca todos os "." no resultado por ",", para manter o padrão nacional, usado pela calculadora.
        textoVisor.innerHTML =  resultado.toString().replace(".", ",");
    } catch (error) {
        // Caso a pessoa faça um cálculo ilógico, como 1×(,), o código dará erro e virá para cá, simplesmente exibindo "erro" na tela.
        textoVisor.innerHTML =  "erro";
    }
}

/** Separa a equação, convertendo a string para um array, separando corretamente números de operadores.
 * 
 * Por exemplo: a função recebe "123+4.5×6÷7" e retorna ["123", "+", "4.5", "×", "6", "÷", "7"]. */
function separaEquacao() {
    let equacao = textoVisor.innerHTML.split("");
    let equacaoSeparada = [];
    for (let i = 0; i < equacao.length; i++) {
        // Converte vírgulas em pontos para que o JavaScript entenda.
        if (equacao[i] === ",") {
            equacao[i] = ".";
        }
        if (isNaN(Number(equacao[i])) && equacao[i] != ".") {
            // Se não for nem número, nem ponto (ou seja, se for um operador ou parênteses), ele adiciona como elemento separado.
            equacaoSeparada.push(equacao[i]);
        } else {
            // Caso seja um número ou ponto, ele apenas acrescenta o caractere ao final do último elemento já existe, continuando o número já pushado.
            // Entretanto, caso o último elemento na lista NÃO seja um número, aí ele pusha um novo elemento, iniciando um número novo.
            if (!isNaN(Number(equacaoSeparada[equacaoSeparada.length - 1]))) {
                equacaoSeparada[equacaoSeparada.length - 1] += equacao[i];
            } else {
                equacaoSeparada.push(equacao[i]);
            }
        }
    }
    return equacaoSeparada;
}