const app = {
	socket: null,
	pseudo: null,
	message: null,
	chatDisplayElement: null,
	init: () => {
		console.log('init');
		
		app.socket = io.connect('http://localhost:3000/');
		app.pseudo = prompt('Entre votre Pseudo');
		app.chatDisplayElement = document.querySelector('.chat__display');

		(app.pseudo !== '') && app.socket.emit('pseudo', app.pseudo);

		const formElement = document.getElementById('form');
		formElement.addEventListener('submit', app.handleSubmit);

		app.socket.on('userConnected', (pseudo) => {
			const pElement = document.createElement('p');
			pElement.textContent = `${pseudo} is connected`;
			pElement.classList.add('chat__userConnected');

			app.chatDisplayElement.appendChild(pElement);

			app.scrollbarBottom();
		});

		app.socket.on('message', (message) => {
			console.log(message);
		});

		app.socket.on('userDisconnected', (userDisconnected) => {
			const pElement = document.createElement('p');
			pElement.textContent = userDisconnected;
			pElement.classList.add('chat__userDisconnected');

			app.chatDisplayElement.appendChild(pElement);

			app.scrollbarBottom();
		});
	},
	handleSubmit: (e) => {
		e.preventDefault();

		const inputElement = e.currentTarget.children[0];
		const inputElementValue = inputElement.value;
		console.log(app.chatDisplayElement.scrollTop);

		app.chatDisplayElement.scrollTop = app.chatDisplayElement.scrollHeight;

		inputElementValue !== '' && app.socket.emit('message', inputElementValue);

		app.scrollbarBottom();
	},
	scrollbarBottom: () => {
		app.chatDisplayElement.scrollTop = app.chatDisplayElement.scrollHeight;
	}
}

document.addEventListener('DOMContentLoaded', app.init);