///////////!!!!!!!!!!!!!!!!!!!!   FILÉ  COM HORARIOS  AJUSTTADOS !!!!!!!!!/////////////
//////////////////////////////FILÉ COM HORARIOS AJUSTADOS E INDISPONIBILIDADE DA HORA USADA//////////////////

    
const API_URL = 'http://3b0602628622.sn.mynetname.net:8182//api'; '*'; 'http://3b0602628622.sn.mynetname.net:8182//api'; 'https://barbeariagenese.ddns.info/'; // Substitua pela URL pública

// Função para verificar a URL atual
function isDashboardPage() {
    return window.location.pathname.includes('dashboard.html');
}

// Função para gerar horários fixos
function generateTimeSlots(date, occupiedSlots) {
    const slots = [];
    const day = new Date(date).getDay(); // Obtém o dia da semana (===6 = domingo, >=0 & <=5 = segunda a sabado)

    // Horários disponíveis
    if (day === 6) { // Domingo
        // Horários de 8:00 às 12:00
        for (let hour = 8; hour < 12; hour++) {
            const slot = `${hour.toString().padStart(2, '0')}:00`;
            if (!occupiedSlots.includes(slot)) slots.push(slot);
        }
    } else if (day >= 0 & day <= 5) { // Segunda a sexta (1 a 5)
        // Horários de 7:00 às 18:00
        for (let hour = 7; hour < 19; hour++) { // 19 é exclusivo
            const slot = `${hour.toString().padStart(2, '0')}:00`;
            if (!occupiedSlots.includes(slot)) slots.push(slot);
        }
    } 

    return slots;
}

async function updateTimeSlots() {
    const dateInput = document.getElementById('date');
    const timeSlotSelect = document.getElementById('timeSlot');

    const selectedDate = dateInput.value;
    timeSlotSelect.innerHTML = ''; // Limpar horários anteriores

    if (selectedDate) {
        const token = localStorage.getItem('token');

        // Obter agendamentos existentes para o dia selecionado
        try {
            const response = await fetch(`${API_URL}/appointments?date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let occupiedSlots = [];
            if (response.ok) {
                const appointments = await response.json();
                occupiedSlots = appointments.map(appointment => {
                    const dateTime = new Date(appointment.dateTime);
                    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                });
            }

            // Gerar novos slots com base nos horários ocupados
            const timeSlots = generateTimeSlots(selectedDate, occupiedSlots);
            timeSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timeSlotSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            alert('Erro ao carregar horários ocupados');
        }
    }
}

// Registro de usuários
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
        const username = document.getElementById('username').value;
            const email = document.getElementById('email').value; // Campo de email
                const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
            }
        );

            if (response.ok) {
                alert('Usuário registrado com sucesso');
                window.location.href = 'login.html'; // Redireciona para login
                } else {
                    const errorData = await response.json();
                        alert(`Erro ao registrar o usuário: ${errorData.message}`);
                        }
                    } catch (error) {
                        console.error('Erro ao registrar o usuário:', error);
                        alert('Erro ao conectar ao servidor');
                        }
                    }
                );

// Login de usuários
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Lógica para autenticar o usuário
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);

        // Verificar se o usuário é admin
        if (username === 'admin' || username === 'root') {
            window.location.href = 'admin-dashboard.html'; // Redirecionar para o painel do administrador
        } else {
            window.location.href = 'dashboard.html'; // Redirecionar para o painel do usuário normal
        }
    } else {
        const error = await response.json();
        alert(error.message);
    }
});

// Painel de Controle - só executa se estiver no dashboard e se o usuário tiver token
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

        if (!isDashboardPage() || !token) return; // Executa apenas no dashboard e se o token estiver presente

    // Adiciona o listener ao campo de data
document.getElementById('date')?.addEventListener('change', updateTimeSlots);

    // Carrega os agendamentos existentes
            try {
                const response = await fetch(`${API_URL}/appointments`, {
                    headers: {
                    'Authorization': `Bearer ${token}`
                    }
                }
            );

                if (!response.ok) {
                    throw new Error('Erro na requisição dos agendamentos');
                    }

                    const appointments = await response.json();
                        console.log("Agendamentos carregados:", appointments); // Depuração
                            const appointmentsDiv = document.getElementById('appointments');

                    if (appointments.length === 0) {
                        appointmentsDiv.innerHTML = '<p>Você ainda não fez seu Agendamento, Por favor! Agende seu Serviço.</p>';
                        return;
                        } else {
                            appointmentsDiv.innerHTML = appointments.map(appointment => `
                            <div>
                                <p>${appointment.serviceType} - ${new Date(appointment.dateTime).toLocaleString()}</p>
                                <button onclick="rescheduleAppointment('${appointment._id}')">Remarcar</button>
                                <button onclick="cancelAppointment('${appointment._id}')">Cancelar</button>
                                </div>
                                `).join('');
                                }
                            }
                            catch (error) {
                                console.error('Erro ao carregar os agendamentos:', error); // Depuração
                                    alert('Erro ao carregar os agendamentos');
                                    }
                                }
                            );

// Agendar um novo horário
document.getElementById('appointmentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
        const token = localStorage.getItem('token');
            const serviceType = document.getElementById('serviceType').value;
                const dateTime = `${document.getElementById('date').value}T${document.getElementById('timeSlot').value}:00`; // Formato ISO

    // Validação

    if (!serviceType || !dateTime) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ serviceType, dateTime })
                }
            );

            if (response.ok) {
                alert('Agendamento realizado com sucesso');
                window.location.reload();
                }
                else {
                    alert('Você já tem um agendamento futuro. Cancele ou remarque o atual antes de agendar outro.');
                    }
                }
                    catch (error) {
                    console.error('Erro ao agendar:', error);
                    alert('Erro ao conectar ao servidor');
                    }
                }
            );


////////////////////// Remarcar horário \\\\\\\\\\\\\\\\\\\\\

async function rescheduleAppointment(id) {
    console.log("ID do agendamento:", id);  // Para depurar, verificar o ID no console
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            headers: {
            'Authorization': `Bearer ${token}`
            }
        }
    );

        if (!response.ok) {
            throw new Error('Erro ao obter os detalhes do agendamento');
        }

            const appointment = await response.json();
                const appointmentInfo = `Serviço atual: ${appointment.serviceType}\n
                Data e Hora atual: ${new Date(appointment.dateTime).toLocaleString()}`;

        // Exibir a mensagem de confirmação com os detalhes do agendamento atual
        const userConfirmed = confirm(`Barbearia Gênese diz:\nVocê realmente deseja remarcar um novo horário?\n\n${appointmentInfo}`);

            if (userConfirmed) {
            // Perguntar o novo serviço
                const newServiceType = prompt("Selecione o novo serviço (ex: Corte, Barba, etc.):", appointment.serviceType);
                    if (!newServiceType) return; // Se o usuário cancelar, aborta a operação

            // Perguntar a nova data
                const newDate = prompt("Escolha uma nova data (formato: YYYY-MM-DD):");
                    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                        alert('Data inválida. Por favor, insira no formato YYYY-MM-DD.');
                        return;
                        }

            // Gerar os horários disponíveis para a data selecionada
                const occupiedSlotsResponse = await fetch(`${API_URL}/appointments?date=${newDate}`, {
                    headers: {
                    'Authorization': `Bearer ${token}`
                    }
                }
            )
        ;

                    let occupiedSlots = [];
                        if (occupiedSlotsResponse.ok) {
                            const appointments = await occupiedSlotsResponse.json();
                                occupiedSlots = appointments.map(appointment => {
                                    const dateTime = new Date(appointment.dateTime);
                                        return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        }
                                    )
                                ;
                            }

            // Exibir os horários disponíveis com base nos slots ocupados
        const availableSlots = generateTimeSlots(newDate, occupiedSlots);
            const newTimeSlot = prompt(`Escolha um novo horário (disponíveis: ${availableSlots.join(', ')}):`);
                if (!availableSlots.includes(newTimeSlot)) {
                    alert('Horário inválido ou já ocupado. Por favor, selecione um horário válido.');
                    return;
                    }

            // Confirmar a nova data e hora
        const newDateTime = `${newDate}T${newTimeSlot}:00`;
            const finalConfirmation = confirm(`Confirme os detalhes da remarcação:\nServiço: ${newServiceType}\nData e Hora: ${newDateTime}`);

                if (finalConfirmation) {
                
                    // Enviar a remarcação para o servidor
                
        const rescheduleResponse = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ serviceType: newServiceType, dateTime: newDateTime })
            }
        );

            if (rescheduleResponse.ok) {
                alert('Horário remarcado com sucesso');
                window.location.reload(); // Recarregar a página após a remarcação
                    }
                        else {
                            alert('Erro ao remarcar o horário. Por favor, tente novamente.');
                            }
                        }
                    }
                } 
                            catch (error) {
                                console.error("Erro ao remarcar:", error);
                                alert('Erro ao conectar ao servidor');
                                    }
                                }


// Cancelar agendamento
async function cancelAppointment(id) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

        if (response.ok) {
            alert('Agendamento cancelado com sucesso');
            window.location.reload();
            }
            else {
                alert('Erro ao cancelar o agendamento');
                }
            }
                catch (error) {
                    console.error("Erro ao cancelar:", error);
                     alert('Erro ao conectar ao servidor');
                    }
                }

// Lógica de Logout

document.getElementById('logoutButton')?.addEventListener('click', (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    localStorage.removeItem('token'); // Remove o token do armazenamento local
    window.location.href = 'login.html'; // Redireciona para a página de login
    }
);

// Function to fetch appointments by username
async function fetchAppointmentsByUser(username) {
    try {
        const response = await fetch(`/api/appointments?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }

        const appointments = await response.json();
        // Display appointments in the UI
        displayAppointments(appointments);
    } catch (error) {
        console.error(error);
        alert('Error fetching appointments');
    }
}


let slides = document.querySelectorAll('.slide-container');
let index = 0;

function next(){
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
}

function prev(){
    slides[index].classList.remove('active');
    index = (index - 1 + slides.length) % slides.length;
    slides[index].classList.add('active');
}

setInterval(next, 7000);
