document.addEventListener('DOMContentLoaded', function () {
    const cookieData = getCookie('contato');
    if (cookieData) {
        const formData = JSON.parse(cookieData);
        addLinhaTabela(formData);
    }
});

document.getElementById('formulario-contato').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Obter valores dos campos
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const tipo = document.getElementById('tipo').value;
    const mensagem = document.getElementById('mensagem').value;

    // Validações

    let valid = true;
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!nome) {
        alert('Nome é obrigatório.');
        return false;
    } else if (!regex.test(nome)) {
        alert('Nome inválido, permitido somente letras.');
        return false;
    }

    if (!email || !validateEmail(email)) {
        alert('E-mail inválido.');
        valid = false;
    }

    if (!telefone || !validarTelefone(telefone)) {
        alert('Telefone é obrigatório.');
        valid = false;
    }

    if (!mensagem) {
        alert('Mensagem é obrigatória.');
        valid = false;
    }

    if (!valid) {
        return;
    }

    // Dados para enviar
    const dados = {
        name: nome,
        email: email,
        telefone: telefone,
        tipo: parseInt(tipo),
        mensagem: mensagem
    };

    // Log dos dados a serem enviados
    console.log("Dados para enviar:", JSON.stringify(dados));

    // Enviar dados para o servidor
    try {
        const response = await fetch('http://localhost:3001/contato', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            const result = await response.json();

            setCookie(`contato_${result.id_contato}`, JSON.stringify(dados), 1);
            getCookie('contato');
            alert('Mensagem enviada com sucesso! Sua mensagem poderá ser editada em até 1 hora!');
        } else {
            const error = await response.json();
            console.error('Erro do servidor:', error); // Log do erro do servidor
            alert(`Erro: ${error.message}`);
        }
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error); // Log do erro
        alert('Erro ao enviar a mensagem. Por favor, tente novamente mais tarde.');
    }
});

document.getElementById('editar-contato').addEventListener('click', async function (event) {
    event.preventDefault();
    let id_contato = this.getAttribute('data-id-contato');
    const dados = {
        name: document.getElementById('modal-nome').value,
        email: document.getElementById('modal-email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        mensagem: document.getElementById('modal-mensagem').value
    };

    try {
        const response = await fetch(`http://localhost:3001/contato/${id_contato}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            const result = await response.json();
            modalEditarContato.hide();
            alert(result.message);
            deleteCookie(`contato_${id_contato}`);
            getCookie('contato');
        } else {
            const error = await response.json();
            console.error('Erro do servidor:', error); // Log do erro do servidor
            alert(`Erro: ${error.message}`);
        }
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error); // Log do erro
        alert('Erro ao enviar a mensagem. Por favor, tente novamente mais tarde.');
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validarTelefone(telefone) {
    let valid = true;

    // Verificar se o telefone está presente
    if (!telefone) {
        alert('Telefone é obrigatório.');
        return false;
    }

    // Verificar o comprimento total do telefone
    if (telefone.length !== 14 && telefone.length !== 15) {
        alert('Telefone inválido. Formato esperado: (DD) XXXX-XXXX ou (DD) XXXXX-XXXX');
        return false;
    }

    // Verificar formato (DD) XXXX-XXXX ou (DD) XXXXX-XXXX
    if (telefone[0] !== '(' || telefone[3] !== ')'|| telefone[9] !== '-') {
        alert('Telefone inválido. Formato esperado: (DD) XXXX-XXXX ou (DD) XXXXX-XXXX');
        return false;
    }

    // Verificar se os caracteres das posições específicas são dígitos
    for (let i = 1; i <= 2; i++) {
        if (!isDigit(telefone[i])) {
            alert('Telefone inválido. Formato esperado: (DD) XXXX-XXXX ou (DD) XXXXX-XXXX');
            return false;
        }
    }

    for (let i = 5; i <= 8; i++) {
        if (!isDigit(telefone[i])) {
            alert('Telefone inválido. Formato esperado: (DD) XXXX-XXXX ou (DD) XXXXX-XXXX');
            return false;
        }
    }

    if (telefone.length === 15) {
        if (!isDigit(telefone[10])) {
            alert('Telefone inválido. Formato esperado: (DD) XXXXX-XXXX');
            return false;
        }
        for (let i = 11; i <= 14; i++) {
            if (!isDigit(telefone[i])) {
                alert('Telefone inválido. Formato esperado: (DD) XXXXX-XXXX');
                return false;
            }
        }
    } else {
        for (let i = 10; i <= 13; i++) {
            if (!isDigit(telefone[i])) {
                alert('Telefone inválido. Formato esperado: (DD) XXXX-XXXX');
                return false;
            }
        }
    }

    return valid;
}

function isDigit(char) {
    return char >= '0' && char <= '9';
}



const modalEditarContato = new bootstrap.Modal(document.getElementById('modalEditarContato'));
async function editarContato(button) {
    let id_contato = button.getAttribute('data-id-contato');
    try {
        const response = await fetch(`http://localhost:3001/contato/${id_contato}`, {
            method: 'GET'
        });

        if (response.ok) {
            const result = await response.json();
            modalEditarContato.show();
            document.getElementById('modal-nome').value = result.name;
            document.getElementById('modal-email').value = result.email;
            document.getElementById('modal-telefone').value = result.telefone;
            document.getElementById('modal-mensagem').value = result.mensagem;

            document.getElementById('editar-contato').setAttribute('data-id-contato', id_contato);
        } else {
            const error = await response.json();
            console.error('Erro do servidor:', error); // Log do erro do servidor
            alert(`Erro: ${error.message}`);
        }
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error); // Log do erro
        alert('Erro ao enviar a mensagem. Por favor, tente novamente mais tarde.');
    }
}

function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    const cookieValue = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
    console.log("Setting cookie:", cookieValue); // Log do valor do cookie
    document.cookie = cookieValue;
}

function getCookie(name) {
    limparTabela();
    const values = document.cookie.split(';');
    for (let i = 0; i < values.length; i++) {
        let value = values[i].trim();
        if (value.startsWith(name + '_')) {
            const parts = value.split('=');
            const id_contato = parts[0].split('_')[1];
            const cookieContent = decodeURIComponent(parts[1]);
            console.log("Reading cookie content:", cookieContent); // Log do conteúdo do cookie
            const conteudo_cookie = JSON.parse(cookieContent);
            addLinhaTabela(id_contato, conteudo_cookie);
        }
    }
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function addLinhaTabela(id_contato, dados) {
    const tableBody = document.getElementById('table-contato').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    newRow.value = id_contato;

    const nameLinha = newRow.insertCell(0);
    const emailLinha = newRow.insertCell(1);
    const telefoneLinha = newRow.insertCell(2);
    const mensagemLinha = newRow.insertCell(3);
    const actionCell = newRow.insertCell(4);

    nameLinha.textContent = dados.name;
    telefoneLinha.textContent = dados.telefone;
    emailLinha.textContent = dados.email;
    mensagemLinha.textContent = dados.mensagem;

    actionCell.innerHTML = `<button type="button" class="btn btn-success" data-id-contato="${id_contato}" onclick="editarContato(this)">Editar</button>`;
}

function limparTabela() {
    const tableBody = document.getElementById('table-contato').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
}
