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
	usersConnected: null,
	arrUsersWriting: [],
	inputMessage: null,
	userWriting: '',
	userWritingElement: null,
	init: () => {
		app.chatDisplayElement = document.querySelector('.chat__display');
		app.userDisconnected = document.getElementById('userDisconnected');
		app.numberUsersConnected = document.getElementById('numberUsersConnected');
		app.usersConnected = document.getElementById('usersConnected');
		app.userWritingElement = document.getElementById('userWriting');

		app.iconUser = document.getElementById('iconUser');
		app.iconUser.addEventListener('click', app.handleClickUserIcon);

		app.chatDisplayElement.addEventListener('scroll', app.displayTheScrollBar);

		const formChatElement = document.getElementById('chat__form');
		formChatElement.addEventListener('submit', app.handleFormChatSubmit);

		app.inputMessage = document.getElementById('input__message');
		app.inputMessage.addEventListener('keyup', app.handleKeyup);

		app.socket = io.connect('http://localhost:3000/');
		app.socketsListener();
	},
	socketsListener: () => {
		app.socket.on('lastUserConnected', ({ numberUsersConnected }) => {
			app.numberUsersConnected.textContent = numberUsersConnected;
		});

		app.socket.on('userDisconnected', ({ userDisconnected, numberUsersConnected, currentUser }) => {
			app.userDisconnected.style.display = 'block';
			app.numberUsersConnected.textContent = numberUsersConnected;
			app.userDisconnected.textContent = `${userDisconnected}`;


			app.deleteUSerIfNotWriting('', currentUser);
			app.checkIfUserWriting();

			const listUsersConnected = document.getElementById('listUsersConnected');
			const allUsersConnected = listUsersConnected.childNodes;
			
			allUsersConnected.forEach(user => {
				if (user.textContent === currentUser) {
					listUsersConnected.removeChild(user);
				}
			});
		});

		app.socket.on('message', ({ message, pseudo }) => {
			app.addMessageWithPseudo(pseudo, message);

			app.deleteUSerIfNotWriting(message, pseudo);
			app.checkIfUserWriting();

			app.scrollbarBottom();
		});

		app.socket.on('userTyping', ({ currentUser, message }) => {
			if (!app.arrUsersWriting.includes(currentUser)) app.arrUsersWriting.push(currentUser);

			app.deleteUSerIfNotWriting(message, currentUser);
			app.checkIfUserWriting();
		});

		app.socket.on('addUserInListUserConnected', ({ pseudo }) => {
			const ulElement = document.getElementById('listUsersConnected');
			const liElement = document.createElement('li');
			liElement.textContent = pseudo;
			liElement.classList.add('chat__userConnected');

			ulElement.appendChild(liElement);
		});
	},
	displayTheScrollBar: () => {
		if (app.timer !== null) {
			clearTimeout(app.timer);
			
			app.chatDisplayElement.classList.remove('chat__display--hideScroll');
			app.chatDisplayElement.classList.add('chat__display--active');
		}

		app.timer = setTimeout(() => {
			app.chatDisplayElement.classList.add('chat__display--hideScroll');
			app.chatDisplayElement.classList.remove('chat__display--active');
		}, 400);
	},
	handleFormChatSubmit: (e) => {
		e.preventDefault();

		const inputElement = e.currentTarget.children[0];
		const inputElementValue = inputElement.value;

		if (inputElementValue !== '') {
			app.socket.emit('message', inputElementValue);

			app.addMessageWithPseudo('You', inputElementValue);
			
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

		app.chatDisplayElement.insertBefore(divElement, app.userWritingElement);
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

			app.usersConnected.classList.add('chat__usersConnected--show');
			app.usersConnected.childNodes[1].classList.add('chat__listUsersConnected--show');
		}, 500)
	},
	handleClickIconMessage: () => {
		app.usersConnected.classList.remove('chat__usersConnected--show');
		app.usersConnected.childNodes[1].classList.remove('chat__listUsersConnected--show');
		
		setTimeout(() => {
			chatUser.classList.remove('chat__users--active');
			app.iconMessage.className = 'far fa-user fa-2x';
			app.iconMessage.id = "iconUser";
			app.numberUsersConnected.classList.remove('chat__displayNumber--hide');

			app.iconMessage.removeEventListener('click', app.handleClickIconMessage);
			app.iconUser.addEventListener('click', app.handleClickUserIcon);

			app.chatDisplayElement.classList.remove('chat__display--hide');

		}, 500)
	},
	handleKeyup: (e) => {
		const inputMessageValue = e.currentTarget.value;
		app.socket.emit('userTyping', { message: inputMessageValue });
		
	},
	checkIfUserWriting: () => {
		let userTyping;

		if (app.arrUsersWriting.length === 0) {
			userTyping = '';
		}

		if (app.arrUsersWriting.length === 1) {
			userTyping = `${app.arrUsersWriting[0]} is writing...`;
		};

		if (app.arrUsersWriting.length === 2) {
			console.log('ok');
			userTyping = `${app.arrUsersWriting[0]} et ${app.arrUsersWriting[1]} are writing...`;
		};

		if (app.arrUsersWriting.length > 2) {
			const remainingUser = app.arrUsersWriting.length - 2;

			if (app.arrUsersWriting.length === 3) {
				userTyping = `${app.arrUsersWriting[0]}, ${app.arrUsersWriting[1]} et ${remainingUser} other user are writing...`;
			}
			else {
				userTyping = `${app.arrUsersWriting[0]}, ${app.arrUsersWriting[1]} et ${remainingUser} others users are writing...`;
			}
			
		};

		app.userWritingElement.textContent = userTyping;
	},
	deleteUSerIfNotWriting: (message, pseudo) => {
		if (app.arrUsersWriting.includes(pseudo) && message === '') {
			const arrUsersWritingFilter = app.arrUsersWriting.filter(user => user !== pseudo);
			app.arrUsersWriting = arrUsersWritingFilter;
		};
	}
}

document.addEventListener('DOMContentLoaded', app.init);