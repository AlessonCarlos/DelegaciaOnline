document.addEventListener('DOMContentLoaded', function () {
    const chatInterface = document.getElementById('chat-interface');
    const startChatBtn = document.getElementById('start-chat');
    const closeChatBtn = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message');

    // Memória do usuário
    let userData = {
        ocorrencia: {}
    };
    
    // Estados de fluxo para controle
    let currentState = "start";
    let expectingInput = false;
    let inputType = "";
    let inputValidation = null;
    let isRendering = false; // Flag para controlar se estamos renderizando

    // Fluxo de conversa melhorado
    const conversationFlow = {
        start: {
            message: "👮‍♂️ Olá! Sou o assistente virtual da Polícia Civil de Pernambuco. Como posso te ajudar hoje?",
            options: [
                { text: "Registrar ocorrência", next: "register" },
                { text: "Consultar protocolo", next: "consult" },
                { text: "Informações gerais", next: "info" },
                { text: "Falar com atendente", next: "human" }
            ]
        },
        
        // Coleta de dados pessoais
        get_personal_data: {
            message: "Antes de começarmos, preciso de algumas informações pessoais:",
            inputPrompt: "Digite seu nome completo:", // Nova propriedade
            input: "nome",
            next: "get_cpf",
            validation: (value) => {
                if (!value || value.trim().length < 3) {
                    return "Por favor, informe seu nome completo";
                }
                return null;
            }
        },
        get_cpf: {
            message: "Agora preciso do seu CPF (apenas números):",
            input: "cpf",
            next: "get_idade",
            validation: (value) => {
                const cpfRegex = /^\d{11}$/;
                if (!cpfRegex.test(value)) {
                    return "CPF deve conter exatamente 11 números";
                }
                return null;
            }
        },
        get_idade: {
            message: "Por favor, informe sua idade:",
            input: "idade",
            next: "get_telefone",
            validation: (value) => {
                const age = parseInt(value);
                if (isNaN(age) || age < 12 || age > 120) {
                    return "Por favor, informe uma idade válida (entre 12 e 120 anos)";
                }
                return null;
            }
        },
        get_telefone: {
            message: "Agora preciso do seu telefone para contato (com DDD):",
            input: "telefone",
            next: "register",
            validation: (value) => {
                const phoneRegex = /^\d{10,11}$/;
                if (!phoneRegex.test(value)) {
                    return "Telefone deve conter 10 ou 11 números (com DDD)";
                }
                return null;
            }
        },
        
        // Registro de ocorrência
        register: {
            message: "Qual tipo de ocorrência deseja registrar?",
            options: [
                { text: "Som alto/perturbação", next: "noise_complaint" },
                { text: "Furto/Roubo", next: "theft_complaint" },
                { text: "Ameaça", next: "threat_complaint" },
                { text: "Vias públicas", next: "public_way_complaint" },
                { text: "Outro tipo", next: "other_complaint" },
                { text: "Voltar", next: "start" }
            ]
        },
        
        // Fluxo para som alto
        noise_complaint: {
            message: "Ok, vamos registrar sobre som alto. Pode me informar o endereço onde ocorre o problema?",
            input: "endereco",
            next: "noise_time",
            field: "ocorrencia.endereco",
            validation: (value) => {
                if (!value || value.trim().length < 5) {
                    return "Por favor, informe um endereço válido";
                }
                return null;
            }
        },
        noise_time: {
            message: "Obrigado! Agora, em que horário isso costuma acontecer?",
            input: "horario",
            next: "noise_frequency",
            field: "ocorrencia.horario"
        },
        noise_frequency: {
            message: "Beleza. E com que frequência acontece? (todos os dias, fins de semana, etc.)",
            input: "frequencia",
            next: "noise_details",
            field: "ocorrencia.frequencia"
        },
        noise_details: {
            message: "Descreva com mais detalhes a situação, incluindo qualquer informação relevante:",
            input: "detalhes",
            next: "noise_confirmation",
            field: "ocorrencia.detalhes"
        },
        noise_confirmation: {
            message: (data) => 
                `Por favor, confirme os dados da ocorrência:\n\n` +
                `🔊 Ocorrência de Som Alto\n` +
                `📍 Endereço: ${data.ocorrencia.endereco}\n` +
                `🕒 Horário: ${data.ocorrencia.horario}\n` +
                `📅 Frequência: ${data.ocorrencia.frequencia}\n` +
                `📝 Detalhes: ${data.ocorrencia.detalhes}\n\n` +
                `Os dados estão corretos?`,
            options: [
                { text: "Sim, confirmar", next: "noise_final" },
                { text: "Não, corrigir", next: "noise_complaint" }
            ]
        },
        noise_final: {
            message: (data) =>
                `✅ Obrigado, ${data.nome || "cidadão"}! Sua ocorrência de som alto foi registrada.\n\n` +
                `📋 Número do protocolo: **PCPE-${Date.now()}**\n` +
                `Guarde esse número para acompanhar depois.\n\n` +
                `Em casos de urgência, ligue para 190.`,
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        
        // Fluxo para furto/roubo
        theft_complaint: {
            message: "Entendo. Vamos registrar a ocorrência de furto/roubo. Quando isso aconteceu?",
            input: "data_ocorrencia",
            next: "theft_location",
            field: "ocorrencia.data_ocorrencia"
        },
        theft_location: {
            message: "Onde exatamente aconteceu o furto/roubo?",
            input: "local",
            next: "theft_description",
            field: "ocorrencia.local",
            validation: (value) => {
                if (!value || value.trim().length < 5) {
                    return "Por favor, informe um local válido";
                }
                return null;
            }
        },
        theft_description: {
            message: "Descreva o que foi levado e qualquer detalhe relevante:",
            input: "descricao",
            next: "theft_value",
            field: "ocorrencia.descricao"
        },
        theft_value: {
            message: "Qual o valor aproximado do que foi levado?",
            input: "valor",
            next: "theft_confirmation",
            field: "ocorrencia.valor"
        },
        theft_confirmation: {
            message: (data) => 
                `Por favor, confirme os dados da ocorrência:\n\n` +
                `💰 Ocorrência de Furto/Roubo\n` +
                `📅 Data: ${data.ocorrencia.data_ocorrencia}\n` +
                `📍 Local: ${data.ocorrencia.local}\n` +
                `📝 Descrição: ${data.ocorrencia.descricao}\n` +
                `💵 Valor: ${data.ocorrencia.valor}\n\n` +
                `Os dados estão corretos?`,
            options: [
                { text: "Sim, confirmar", next: "theft_final" },
                { text: "Não, corrigir", next: "theft_complaint" }
            ]
        },
        theft_final: {
            message: (data) =>
                `✅ Obrigado, ${data.nome || "cidadão"}! Sua ocorrência de furto/roubo foi registrada.\n\n` +
                `📋 Número do protocolo: **PCPE-${Date.now()}**\n` +
                `Guarde esse número para acompanhar depois.\n\n` +
                `Em casos de urgência, ligue para 190.`,
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        
        // Outras ocorrências (estrutura similar pode ser adicionada para outros tipos)
        other_complaint: {
            message: "Por favor, descreva brevemente o tipo de ocorrência que deseja registrar:",
            input: "tipo_ocorrencia",
            next: "other_details",
            field: "ocorrencia.tipo_ocorrencia"
        },
        other_details: {
            message: "Agora forneça todos os detalhes relevantes sobre a ocorrência:",
            input: "detalhes",
            next: "other_confirmation",
            field: "ocorrencia.detalhes"
        },
        other_confirmation: {
            message: (data) => 
                `Por favor, confirme os dados da ocorrência:\n\n` +
                `📋 Tipo: ${data.ocorrencia.tipo_ocorrencia}\n` +
                `📝 Detalhes: ${data.ocorrencia.detalhes}\n\n` +
                `Os dados estão corretos?`,
            options: [
                { text: "Sim, confirmar", next: "other_final" },
                { text: "Não, corrigir", next: "other_complaint" }
            ]
        },
        other_final: {
            message: (data) =>
                `✅ Obrigado, ${data.nome || "cidadão"}! Sua ocorrência foi registrada.\n\n` +
                `📋 Número do protocolo: **PCPE-${Date.now()}**\n` +
                `Guarde esse número para acompanhar depois.\n\n` +
                `Em casos de urgência, ligue para 190.`,
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        
        // Consulta de protocolo
        consult: {
            message: "Digite o número do protocolo para consulta:",
            input: "protocol_number",
            next: "protocol_result",
            validation: (value) => {
                if (!value || value.trim().length < 5) {
                    return "Por favor, informe um número de protocolo válido";
                }
                return null;
            }
        },
        protocol_result: {
            message: (data) =>
                `🔎 Consultando o protocolo **${data.protocol_number}**...\n\n` +
                `Status: Em análise\nÚltima atualização: ${new Date().toLocaleDateString()}\n` +
                `Previsão de conclusão: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        
        // Informações gerais
        info: {
            message: "Sobre qual assunto deseja informações?",
            options: [
                { text: "Delegacias próximas", next: "stations" },
                { text: "Documentação necessária", next: "docs" },
                { text: "Outros serviços", next: "other_services" },
                { text: "Voltar", next: "start" }
            ]
        },
        stations: {
            message: "📍 Para encontrar delegacias próximas, acesse: https://www.policiacivil.pe.gov.br/delegacias",
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        docs: {
            message: "📝 Documentos geralmente necessários: RG, CPF e comprovante de residência. Para casos específicos, podem ser necessários outros documentos.",
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        other_services: {
            message: "ℹ️ Outros serviços disponíveis: emissão de BO online, agendamento presencial, consulta de documentos perdidos.",
            options: [{ text: "Voltar ao início", next: "start" }]
        },
        
        // Falar com atendente
        human: {
            message: "📞 Um atendente entrará em contato em breve. Deseja solicitar retorno por telefone ou e-mail?",
            options: [
                { text: "Telefone", next: "callback" },
                { text: "E-mail", next: "email" },
                { text: "Voltar", next: "start" }
            ]
        },
        callback: {
            message: "📞 Informe seu número de telefone para que possamos retornar:",
            input: "phone",
            next: "end_human",
            validation: (value) => {
                const phoneRegex = /^\d{10,11}$/;
                if (!phoneRegex.test(value)) {
                    return "Telefone deve conter 10 ou 11 números (com DDD)";
                }
                return null;
            }
        },
        email: {
            message: "📧 Informe seu e-mail para que possamos entrar em contato:",
            input: "email",
            next: "end_human",
            validation: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return "Por favor, informe um e-mail válido";
                }
                return null;
            }
        },
        end_human: {
            message: (data) =>
                `✅ Obrigado! Um atendente entrará em contato em breve pelo ${data.phone ? 'telefone' : 'e-mail'} fornecido.`,
            options: [{ text: "Voltar ao início", next: "start" }]
        }
    };

    // Iniciar chat
    // Iniciar chat - CORRIGIDO
if (startChatBtn) {
    startChatBtn.addEventListener('click', function () {
        chatInterface.classList.add('active');
        currentState = "start";
        userData = { ocorrencia: {} }; // Resetar memória
        chatMessages.innerHTML = ""; // Limpar histórico
        renderChatState(currentState);
    });
}

// Fechar chat - CORRIGIDO
if (closeChatBtn) {
    closeChatBtn.addEventListener('click', function () {
        chatInterface.classList.remove('active');
    });
}

    // Enviar mensagem
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        chatInput.value = "";
        
        if (expectingInput) {
            processUserInput(message);
        } else {
            addMessage("Por favor, selecione uma das opções abaixo.", "bot");
            renderChatState(currentState);
        }
    }

    function processUserInput(input) {
        const stateData = conversationFlow[currentState];
        
        // Validar entrada se houver uma função de validação
        if (stateData.validation) {
            const error = stateData.validation(input);
            if (error) {
                addMessage(`❌ ${error}`, "bot");
                // Não chamamos renderChatState aqui para evitar duplicação
                return;
            }
        }
        
        // Armazenar o dado no local apropriado
        if (stateData.field) {
            const fieldParts = stateData.field.split('.');
            if (fieldParts.length === 1) {
                userData[fieldParts[0]] = input;
            } else if (fieldParts.length === 2) {
                if (!userData[fieldParts[0]]) userData[fieldParts[0]] = {};
                userData[fieldParts[0]][fieldParts[1]] = input;
            }
        } else if (stateData.input) {
            userData[stateData.input] = input;
        }
        
        let nextState = stateData.next;
        
        // Verificar se precisamos coletar dados pessoais primeiro
        if (nextState === "register" && !userData.nome) {
            nextState = "get_personal_data";
        }
        
        currentState = nextState;
        renderChatState(currentState);
    }

    function renderChatState(state) {
        if (isRendering) return; // Prevenir renderização duplicada
        isRendering = true;
        
        const stateData = conversationFlow[state];
        
        // Verificar se estamos em um estado que coleta dados pessoais
        if (state === "register" && !userData.nome) {
            state = "get_personal_data";
            currentState = "get_personal_data";
        }

        const botMsg =
            typeof stateData.message === "function"
                ? stateData.message(userData)
                : stateData.message;
        addMessage(botMsg, "bot");

        if (stateData.input) {
            expectingInput = true;
            inputType = stateData.input;
            inputValidation = stateData.validation || null;
            const promptMessage = stateData.inputPrompt || "Digite sua resposta abaixo:";
            addMessage(promptMessage, "bot");
        } else {
            expectingInput = false;
            inputType = "";
            inputValidation = null;
        }

        if (stateData.options) {
            const optionsDiv = document.createElement("div");
            optionsDiv.className = "mt-2 flex flex-wrap gap-2";

            stateData.options.forEach((option) => {
                const button = document.createElement("button");
                button.className = "option-button bg-blue-900 text-white px-4 py-2 rounded-lg";
                button.textContent = option.text;
                button.dataset.next = option.next;
                button.addEventListener("click", function () {
                    currentState = this.dataset.next;
                    
                    // Verificar se precisamos coletar dados pessoais primeiro
                    if (currentState === "register" && !userData.nome) {
                        currentState = "get_personal_data";
                    }
                    
                    renderChatState(currentState);
                });
                optionsDiv.appendChild(button);
            });

            chatMessages.appendChild(optionsDiv);
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
        isRendering = false; // Liberar para próxima renderização
    }

    function addMessage(text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${type}-message`;
        
        // Substituir quebras de linha por tags <br>
        const formattedText = text.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `<p>${formattedText}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});