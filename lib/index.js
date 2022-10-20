let apiKey;
let mode;

import {
	getPaymentLink,
	createCardPayment,
	createCustomer,
	findCustomer,
	createCard,
	findPaymentMethod,
	createNetBanking,
	createUpiPayment,
	createQRPayment,
	createPartnerAccount,
} from './api';

export const pay = async function (amount, fee, currency, description, redirectUri) {
	getPaymentLink(apiKey, amount, fee, currency, description, redirectUri, (mode && mode.toLowerCase() === 'test') ? true : false);
}

export const cardPayment = async function (amount, email, name, phone, cardName, cardNumber, cardExpiryMonth, cardExpiryYear, cardCvv, save, paymentMethod) {
	return createCardPayment(
		apiKey,
		amount,
		email,
		name,
		phone,
		(mode && mode.toLowerCase() === 'test') ? true : false,
		cardName,
		cardNumber,
		cardExpiryMonth,
		cardExpiryYear,
		cardCvv,
		save,
		paymentMethod,
		);
}

export const upiPayment = async function (amount, email, name, phone, paymentMethod, vpa) {
	return createUpiPayment(apiKey, amount, email, name, phone, mode && mode.toLowerCase() === 'test' ? true : false, paymentMethod, vpa);
};

export const netBanking = async function (amount, email, name, phone, paymentMethod, vpa) {
	return createNetBanking(apiKey, amount, email, name, phone, mode && mode.toLowerCase() === 'test' ? true : false, paymentMethod, vpa);
};

export const qrPayment = async function (amount, email, name, phone, paymentMethod, vpa) {
	return createQRPayment(apiKey, amount, email, name, phone, mode && mode.toLowerCase() === 'test' ? true : false, paymentMethod, vpa);
};

export const addCustomer = async function (email, name, phone) {
	return createCustomer(apiKey, email, name, phone, (mode && mode.toLowerCase() === 'test') ? true : false)
}

export const getCustomer = async function (name, email, phone) {
	return findCustomer(apiKey, name, email, phone, (mode && mode.toLowerCase() === 'test') ? true : false)
}

export const addCard = async function (name, cvv, number, expiryMonth, expiryYear, customerGid, save) {
	return createCard(apiKey, name, cvv, number, expiryMonth, expiryYear, customerGid, save, (mode && mode.toLowerCase() === 'test') ? true : false)
}

export const getPaymentMethod = async function (paymentMethodGid) {
	return findPaymentMethod(apiKey, paymentMethodGid, (mode && mode.toLowerCase() === 'test') ? true : false)
}

export const partnerAccount = async function (publickKey, redirectUrl) {
	return createPartnerAccount(publickKey, redirectUrl);
};

export const getApiKey = async function(keyValue) {
	apiKey = keyValue;
	return apiKey;
}

// Identify the apikey
const me = document
	.querySelector('script[data-apiKey][data-id="SwirepayCheckout"');
if (me) {
	// apiKey = me.getAttribute('data-apiKey');
	mode = me.getAttribute('data-mode');
	// window.pay = pay;
	window.sp = {
		pay,
		cardPayment,
		addCustomer,
		getCustomer,
		addCard,
		getPaymentMethod,
		upiPayment,
		netBanking,
		partnerAccount,
		getApiKey,
	}
} else {
	console.error("Missing data attributes to the script tag");
}
