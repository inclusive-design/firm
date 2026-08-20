import 'virtual:sugarcube.css';

const disclosureButtons = document.querySelectorAll('[aria-expanded]');
for (const button of disclosureButtons) {
	button.addEventListener('click', (_event) => {
		const expanded = button.getAttribute('aria-expanded') === 'true' || false;
		button.setAttribute('aria-expanded', !expanded);
	});
}
