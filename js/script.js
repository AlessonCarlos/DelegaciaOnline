// // Sistema de conversa automatizado
// document.addEventListener('DOMContentLoaded', function() {
//     const chatMessages = document.getElementById('chat-messages');
//     const chatInput = document.getElementById('chat-input');
//     const sendMessageBtn = document.getElementById('send-message');
    
//         const conversationFlow = {
//         start: {
//             message: "👮‍♂️ Olá! Sou o assistente virtual da Polícia Civil de Pernambuco. Como posso te ajudar hoje?",
//             options: [
//                 { text: "Registrar ocorrência", next: "register" },
//                 { text: "Consultar protocolo", next: "consult" },
//                 { text: "Informações gerais", next: "info" },
//                 { text: "Falar com atendente", next: "human" }
//             ]
//         },
//         register: {
//             message: "Entendi, você quer registrar uma ocorrência. Qual tipo se encaixa melhor?",
//             options: [
//                 { text: "Som alto", next: "noise_complaint" },
//                 { text: "Furto simples", next: "theft_complaint" },
//                 { text: "Outro tipo", next: "other_complaint" },
//                 { text: "Voltar", next: "start" }
//             ]
//         },
//         noise_complaint: {
//             message: "Ok, vamos registrar sobre som alto. Pode me informar o endereço onde ocorre o problema?",
//             input: true,
//             next: "noise_time"
//         },
//         noise_time: {
//             message: "Obrigado. Em que horário isso geralmente acontece?",
//             input: true,
//             next: "noise_final"
//         },
//         noise_final: {
//             message: "✅ Sua ocorrência de som alto foi registrada com sucesso. Protocolo: PCPE-2025-000123.",
//             options: [
//                 { text: "Voltar ao início", next: "start" }
//             ]
//         },
//         consult: {
//             message: "Digite o número do protocolo para consulta:",
//             input: true,
//             next: "protocol_result"
//         },
//         protocol_result: {
//             message: "🔎 Consultando o protocolo #PROTOCOL_NUMBER#...\n\nStatus: Em análise",
//             options: [
//                 { text: "Voltar ao início", next: "start" }
//             ]
//         },
//         info: {
//             message: "Sobre qual assunto deseja informações?",
//             options: [
//                 { text: "Delegacias próximas", next: "stations" },
//                 { text: "Documentação necessária", next: "docs" },
//                 { text: "Voltar", next: "start" }
//             ]
//         },
//         human: {
//             message: "📞 Um atendente entrará em contato em breve. Deseja solicitar retorno por telefone ou e-mail?",
//             options: [
//                 { text: "Telefone", next: "callback" },
//                 { text: "E-mail", next: "email" },
//                 { text: "Voltar", next: "start" }
//             ]
//         }
//     };
    
//     let currentState = "start";
//     let userData = {};

//     // iniciar chat
//     // renderChatState(currentState);

//     if (sendMessageBtn) {
//         sendMessageBtn.addEventListener('click', sendMessage);
//     }
//     if (chatInput) {
//         chatInput.addEventListener('keypress', function(e) {
//             if (e.key === 'Enter') sendMessage();
//         });
//     }

//     function sendMessage() {
//         const message = chatInput.value.trim();
//         if (message === '') return;

//         addMessage(message, 'user');
//         chatInput.value = '';

//         processUserInput(message);
//     }

//     function processUserInput(input) {
//         if (conversationFlow[currentState].input) {
//             if (currentState === "noise_complaint") {
//                 userData.noiseAddress = input;
//             } else if (currentState === "consult") {
//                 userData.protocolNumber = input;
//             }

//             let nextState = conversationFlow[currentState].next;
//             let nextMessage = conversationFlow[nextState].message;

//             if (nextMessage.includes("#PROTOCOL_NUMBER#") && userData.protocolNumber) {
//                 conversationFlow[nextState].message = nextMessage.replace("#PROTOCOL_NUMBER#", userData.protocolNumber);
//             }

//             currentState = nextState;
//             renderChatState(currentState);
//         }
//     }

//     function renderChatState(state) {
//         const stateData = conversationFlow[state];

//         // Exibir mensagem do bot
//         addMessage(stateData.message, 'bot');

//         // Exibir opções (se existirem)
//         if (stateData.options) {
//             const optionsDiv = document.createElement('div');
//             optionsDiv.className = 'options';

//             stateData.options.forEach(option => {
//                 const button = document.createElement('button');
//                 button.className = 'option-button bg-blue-900 text-white px-4 py-2 rounded-lg';
//                 button.textContent = option.text;
//                 button.dataset.next = option.next;
//                 button.addEventListener('click', function() {
//                     currentState = this.dataset.next;
//                     renderChatState(currentState);
//                 });
//                 optionsDiv.appendChild(button);
//             });

//             chatMessages.appendChild(optionsDiv);
//         }

//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }

//     function addMessage(text, type) {
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `message ${type}-message`;
//         messageDiv.innerHTML = `<p>${text}</p>`;
//         chatMessages.appendChild(messageDiv);
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }
// });
