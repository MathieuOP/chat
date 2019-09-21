const app = {
	socket: null,
	pseudo: null,
	message: null,
	userDisconnected: null,
	numberUsersConnected: null,
	timer: null,
	chatDisplayElement: null,
	iconUser: null,
	iconMessage: null,
	listUserConnected: null,
	init: () => {
		
		app.chatDisplayElement = document.querySelector('.chat__display');
		app.userDisconnected = document.getElementById('userDisconnected');
		app.numberUsersConnected = document.getElementById('numberUsersConnected');
		app.listUserConnected = document.getElementById('listUserConnected');

		app.iconUser = document.getElementById('iconUser');
		app.iconUser.addEventListener('click', app.handleClickUserIcon);


		app.chatDisplayElement.addEventListener('scroll', () => {
			if (app.timer !== null) {
				clearTimeout(app.timer);
				
				app.chatDisplayElement.classList.remove('chat__display--hideScroll');
				app.chatDisplayElement.classList.add('chat__display--active');
			}

			app.timer = setTimeout(() => {
				app.chatDisplayElement.classList.add('chat__display--hideScroll');
				app.chatDisplayElement.classList.remove('chat__display--active');
			}, 400);
		});

		const formChatElement = document.getElementById('chat__form');
		formChatElement.addEventListener('submit', app.handleFormChatSubmit);

		const formPseudoElement = document.getElementById('pseudo__form');
		formPseudoElement.addEventListener('submit', app.handleFormPseudoSubmit);
	},
	socketsListener: () => {

		app.socket.on('lastUserConnected', ({pseudo, numberUsersConnected}) => {
			app.numberUsersConnected.textContent = numberUsersConnected;
		})

		app.socket.on('userDisconnected', ({userDisconnected, numberUsersConnected}) => {

			app.userDisconnected.style.display = 'block';
			app.numberUsersConnected.textContent = numberUsersConnected;
			app.userDisconnected.textContent = `${userDisconnected}`;
		});

		app.socket.on('message', ({message, pseudo}) => {
			app.addMessageWithPseudo(pseudo, message);
			app.scrollbarBottom();
		});
	},
	handleFormPseudoSubmit: (e) => {
		e.preventDefault();

		const inputElement = e.currentTarget.children[1];
		const inputElementValue = inputElement.value;

		if (inputElementValue !== '' && inputElementValue !== undefined) {
			
			const sectionPseudoElement = document.getElementById('pseudo');
			const sectionChatElement = document.getElementById('chat');
			
			app.pseudo = inputElementValue;
			app.socket = io.connect('http://localhost:3000/');
			app.socket.emit('pseudo', app.pseudo);
			app.socketsListener();

			sectionPseudoElement.classList.add('pseudo--hide');
			sectionChatElement.classList.add('chat--show');

			inputElement.value = '';
		}
	},
	handleFormChatSubmit: (e) => {
		e.preventDefault();

		const inputElement = e.currentTarget.children[0];
		const inputElementValue = inputElement.value;

		if (inputElementValue !== '') {
			app.socket.emit('message', inputElementValue);

			app.addMessageWithPseudo('Me', inputElementValue);
			
			inputElement.value = '';

			app.scrollbarBottom();
		};
	},
	scrollbarBottom: () => {
		app.chatDisplayElement.scrollTop = app.chatDisplayElement.scrollHeight;
	},
	addMessageWithPseudo: (pseudo, message) => {
		const divElement = document.createElement('div');
		divElement.classList.add('chat__wrapper');

		const pPseudoElement = document.createElement('p');
		pPseudoElement.innerHTML = `${pseudo}: `;
		pPseudoElement.classList.add('chat__pseudo');
		
		const pMessageElement = document.createElement('p');
		pMessageElement.innerHTML = message;
		pMessageElement.classList.add('chat__message');

		divElement.appendChild(pPseudoElement);
		divElement.appendChild(pMessageElement);

		app.chatDisplayElement.appendChild(divElement);
	},
	handleClickUserIcon: () => {
		const chatUser = document.getElementById('chatUser');

		app.chatDisplayElement.classList.add('chat__display--hide');
		
		setTimeout(() => {
			chatUser.classList.add('chat__users--active');
			app.iconUser.className = 'far fa-comments fa-2x';
			app.iconUser.id = "iconMessage";
			app.numberUsersConnected.classList.add('chat__displayNumber--hide');

			app.iconUser.removeEventListener('click', app.handleClickUserIcon);

			app.iconMessage = document.getElementById('iconMessage');
			app.iconMessage.addEventListener('click', app.handleClickIconMessage);

			app.listUserConnected.classList.add('chat__listUserConnected--show');
		}, 500)
	},
	handleClickIconMessage: () => {
		app.listUserConnected.classList.remove('chat__listUserConnected--show');
		
		setTimeout(() => {
			chatUser.classList.remove('chat__users--active');
			app.iconMessage.className = 'far fa-user fa-2x';
			app.iconMessage.id = "iconUser";
			app.numberUsersConnected.classList.remove('chat__displayNumber--hide');

			app.iconMessage.removeEventListener('click', app.handleClickIconMessage);
			app.iconUser.addEventListener('click', app.handleClickUserIcon);

			app.chatDisplayElement.classList.remove('chat__display--hide');

		}, 500)
	}
}

document.addEventListener('DOMContentLoaded', app.init);