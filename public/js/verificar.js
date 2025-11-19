function validarForm(submit) {
    submit.preventDefault(); // Impede o envio tradicional do formulário

    let isValid = true;

    // Validação de cada campo (isso deve retornar verdadeiro ou falso)
    isValid = isValid && validac(document.querySelector('#nome'));
    isValid = isValid && validaend(document.querySelector('#endereco'));
    isValid = isValid && validaci(document.querySelector('#cidade'));
    isValid = isValid && validas(document.querySelector('input[name="sexo"]:checked'));
    isValid = isValid && validad(document.querySelector('#dataNascimento'));
    isValid = isValid && validarCPF(document.querySelector('#cpf'));
    isValid = isValid && validaemail(document.querySelector('#email'));
    isValid = isValid && validacep(document.querySelector('#cep'));
    isValid = isValid && validarSenhas();
    isValid = isValid && validatel(document.querySelector('#telefone'));

    // Validação de termos
    const termos = document.querySelector('#termos');
    if (!termos.checked) {
        isValid = false;
        document.querySelector('.erro-termos').innerText = "Você deve aceitar os termos e condições.";
        document.querySelector('.erro-termos').style.color = "red";
    } else {
        document.querySelector('.erro-termos').innerText = "";
    }

    // Se todos os campos forem válidos, exibe a imagem de sucesso e redireciona
    if (isValid) {
        alert("Formulário validado com sucesso!");

        // Exibe a imagem de sucesso
        document.querySelector('#imagemSucesso').style.display = "block";

        // Limpa o formulário após sucesso
        document.querySelector("#formCadastro").reset();

        // Esconde a imagem de sucesso após o reset
        setTimeout(() => {
            document.querySelector('#imagemSucesso').style.display = "none";
        }, 5000); // 5 segundos

        // Redireciona para a página de confirmação
        window.location.href = "confirmacao.html";
    } else {
        alert("Erro no envio. Por favor, corrija os campos inválidos.");
    }
}

// funcao valida sexo
function validas(input) {
    let sex = input.value;  // Pega o valor do select               //chamando por onchange = pega a funcao quando e alterada
    let feedback = document.querySelector('.erro-sexo');

    if (sex === "" || sex === "Selecione") {  // Verifica se o valor está vazio ou se a opção "Selecione" foi escolhida
        input.style.borderColor = "red";  
        feedback.innerText = "Insira o sexo.";
        feedback.style.color = "red";
        return false;
    } else {
        input.style.borderColor = "green";
        feedback.innerText = ""; 
        return true;
    }
}


// Funcao valida cidade
function validaci(input) {
    let cid = input.value.trim();  //pegando o valor
    let feedback = document.querySelector('.erro-cidade');  

    if (cid === "") {
        input.style.borderColor = "red";  
        feedback.innerText = "Insira a Cidade.";
        feedback.style.color = "red";
        return false;
    } else {
        input.style.borderColor = "green";
        feedback.innerText = ""; 
        return true;
    }
}

// Funcao valida endereço
function validaend(input) {
    let end = input.value.trim();
    let feedback = document.querySelector('.erro-endereco'); 
 
    if (end === "") {           //verificando se ta vazio
        input.style.borderColor = "red";  
        feedback.innerText = "Insira o Endereço.";
        feedback.style.color = "red";
        return false;
    } else {
        input.style.borderColor = "green";
        feedback.innerText = ""; 
        return true;
    }
}

// funcao de valida data
function validad(input){
    let data = input.value.trim();
    let feedback = document.querySelector('.erro-data');

    if(data === ""){                //verificando se ta vazio
        input.style.borderColor = "red";  
        feedback.innerText = "Insira a data de nacimento.";
        feedback.style.color = "red";
        return false;
    }else{
        input.style.borderColor = "green";
        feedback.innerText = ""; 
        return true;
    }
}
-
// bloqueando o digitamento de numero 
function blockn(event) {
    const tecla = event.key;  // Obtém a tecla pressionada

    // Verifica se a tecla pressionada é um número (0-9) ou não
    if (/\d/.test(tecla)) {
        event.preventDefault();  // Impede a digitação de números
    }
}


// Funcao de valida nome
function validac(input) {
    let name = input.value.trim();     // Obtém o valor do campo
    let feedback = document.querySelector('.erro-nome'); 

    if(name === ""){                     //verificando se ta vazio
        input.style.borderColor = "red";  
        feedback.innerText = "Insira o nome";
        feedback.style.color = "red";
        return false;
    }
    if (name.length < 7) {                  //verificando se e menor que 7

        input.style.borderColor = "red";  
        feedback.innerText = "Nome muito curto.";
        feedback.style.color = "red";
        return false;
    } else {
      
        input.style.borderColor = "green";
        feedback.innerText = ""; 
        return true;
    }

}

// Função de máscara para CPF
function mascaracpf(event) {
    var cpf = event.target.value.replace(/\D/g, "");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    event.target.value = cpf;
}

//Funcao valida cpf
function validarCPF(event) {
    let input = event.target;
    let cpf = input.value.replace(/[^\d]+/g, ""); // Remove tudo que não for número
    const feedback = document.querySelector(".erro-cpf"); // Elemento para exibir mensagem de erro
    let isValid = true;

    // Verifica se o CPF está no formato correto
    if (
        cpf.length !== 11 ||
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999"
    ) {
        isValid = false;
    } else {
        // Calcula o primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) isValid = false;

        // Calcula o segundo dígito verificador
        if (isValid) {
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cpf.charAt(i)) * (11 - i);
            }
            rev = 11 - (sum % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(cpf.charAt(10))) isValid = false;
        }
    }

    // Exibe feedback
    if (event.type === "blur") {
        if (!isValid) {
            input.style.borderColor = "red";  // manda mensagem de erro
            feedback.innerText = "CPF inválido. Verifique os números digitados.";
            feedback.style.color = "red";
        } else {
            input.style.borderColor = "green";
            feedback.innerText = ""; // Limpa mensagem de erro
        }
    }
    if (cpf === "") {       //verificando se ta vazio
        input.style.borderColor = "red";
        feedback.innerText = "Insira o CPF.";
        feedback.style.color = "red";
        return false;
    }
}

//Funcao valida email
function validaemail(event) {
    let input = event.target;
    let email = input.value;
    const feedback = document.querySelector(".erro-email"); 
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/;  // Definindo o padrão de e-mail

    // Valida se o e-mail corresponde ao padrão da regex
    const isValid = regex.test(email);

    
    if (isValid) {
        input.style.borderColor = "green"; // Se válido
        feedback.innerText = ""; 
        return true;
    } else {
        input.style.borderColor = "red"; 
        feedback.innerText = "Email inválido"; 
        feedback.style.color = "red";
        return false;
    }
    if(email === ""){           // verificando se ta vazio
        input.style.borderColor = "red"; 
        feedback.innerText = "Insira o Email"; 
        feedback.style.color = "red";
        return false;
    }
}

//Funcao valida cep
function validacep(event) {
    let input = event.target;
    let cep = input.value.replace(/\D/g, "");  
    let feedback = document.querySelector(".erro-cep");
    
    // Aplica a máscara no campo de CEP
    if (cep.length <= 5) {
        input.value = cep.replace(/(\d{5})(\d*)/, "$1-$2"); // Formata o CEP com o hífen (primeiros 5 números)
    } else {
        input.value = cep.replace(/(\d{5})(\d{3})/, "$1-$2"); // Formata o CEP completo
    }
    
    // Expressão regular para validar o formato do CEP
    const regex = /^\d{5}-\d{3}$/;  // O formato de CEP esperado é XXXXX-XXX
    const isValid = regex.test(input.value);

    // Verifica se o evento é de perda de foco (blur)
    if (event.type === "blur") {
        if (isValid) {
            input.style.borderColor = "green"; // Se válido, borda verde
            feedback.innerText = ""; 
            return true;
        } else {
            input.style.borderColor = "red";  
            feedback.innerText = "CEP inválido"; 
            feedback.style.color = "red";
            return false;
        }
    }
    if(cep === ""){                     //verificando se ta vazio
        input.style.borderColor = "red";  
        feedback.innerText = "Insira o CEP"; 
        feedback.style.color = "red";
        return false;
    }
}

//Funcao valida senha
function validarSenhas() {
    // Obter os valores das senhas
    let senha = document.getElementById('senha').value;
    let confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Obter os elementos de feedback (mensagens de erro)
    let feedbackSenha = document.querySelector('.erro-sen');
    let feedbackConfirmaSenha = document.querySelector('.erro-confs');
    
    if(senha === ""){                               //verificando se ta vazio
        document.getElementById('senha').style.borderColor = "red"; 
        document.getElementById('confirmarSenha').style.borderColor = "red"; 
        feedbackSenha.innerText = "";  
        feedbackSenha.innerText = "insira a Senha."; 
        feedbackSenha.style.color = "red"; 
        feedbackConfirmaSenha.style.color = "red"; 
        return false;
    }
    // Validação para verificar se as senhas são iguais
    if (senha !== confirmarSenha) {
        // Se as senhas não são iguais
        document.getElementById('senha').style.borderColor = "red"; 
        document.getElementById('confirmarSenha').style.borderColor = "red"; 
        feedbackSenha.innerText = "";  
        feedbackConfirmaSenha.innerText = "As senhas não coincidem."; 
        feedbackConfirmaSenha.style.color = "red"; 
        return false;
    } else {
        // Se as senhas são iguais
        document.getElementById('senha').style.borderColor = "green";  
        document.getElementById('confirmarSenha').style.borderColor = "green";  
        feedbackSenha.innerText = "";  
        feedbackConfirmaSenha.innerText = ""; 
        return true;
    }


}

//Funcao valida telefone
function validatel(event) {
    let input = event.target;
    let tel = input.value.replace(/\D/g,""); 

    tel = tel.replace(/^(\d{2})(\d)/, "($1) $2"); 
    tel = tel.replace(/(\d{4,5})(\d{4})$/, "$1-$2"); 
 
    input.value = tel;

    if (event.type === "blur") {
        const length = tel.replace(/\D/g, "").length; 
        const feedback = document.querySelector(".erro"); 
        if (length < 10 && tel === "") {      //verificando se ta vazio e se e menor que 10
           
            input.style.borderColor = "red";
            feedback.innerText = "Número de telefone muito curto. Deve conter pelo menos 10 dígitos.";
            feedback.style.color = "red";
            return false;
        } else {
          
            input.style.borderColor = "green";
            feedback.innerText = "";
            return true;
        }
    }


}

//valida assunto
function assun(input){
    let assu = input.value.trim();
    let feedback = document.querySelector('.erro-assunto');

    if(assu === "" || assu.length < 3){
        input.style.borderColor = "red";
        feedback.innerText = "Insira o assunto";
        feedback.style.color = "red";
    } else {
        input.style.borderColor = "green";
        feedback.innerText = "";
        return true;
    }
}

