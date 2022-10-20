const getEndpoints = function (test) {
	if (test) {
		return {
			gateway: "https://staging-backend.swirepay.com",
		};
	}
	return {
		gateway: "https://api.swirepay.com",
	};
};

export const findCustomer = async function (apiKey, email, name, phone, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/customer`;
	const config = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
	};

	let firstQuery = true;
	if (name || email || phone) {
		if (name) {
			url += `?name.EQ=${name}`;
			firstQuery = false;
		}
		if (email) {
			if (firstQuery) {
				url += `?email.EQ=${email}`;
				firstQuery = false;
			} else {
				url += `&email.EQ=${email}`;
			}
		}
		if (phone) {
			if (firstQuery) {
				url += `?phoneNumber.EQ=${phone}`;
				firstQuery = false;
			} else {
				url += `&phoneNumber.EQ=${phone}`;
			}
		}

	}
	const response = await fetch(url, config);
	return await response.json();
}

export const createCustomer = async function (apiKey, name, email, phone, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/customer`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify({
			name,
			email,
			phoneNumber: phone
		}),
	};
	const response = await fetch(url, config);
	return await response.json();
}

export const createQR = async function (apiKey, customerGid, vpa, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/payment-method`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify({
			type: "UPI",
			subType: vpa,
			customerGid,
		}),
	};
	const response = await fetch(url, config);
	const result = await response.json();
	return await result;
}

export const createBank = async function (apiKey, customerGid, bankGid, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/payment-method`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify({
			netbanking: {
				swirepayBankGid: bankGid
			},
			type: "NET_BANKING",
			customerGid,
		}),
	};
	const response = await fetch(url, config);
	const result = await response.json();
	return await result;
}

export const createUpi = async function (apiKey, customerGid, vpa, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/payment-method`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify({
			upi: {
				vpa
			},
			type: "UPI",
			customerGid,
		}),
	};
	const response = await fetch(url, config);
	const result = await response.json();
	return await result;
}

export const saveCard = async function (apiKey, currencyCode, paymentMethodGid, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/setup-session`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify({
			currencyCode: currencyCode || null,
			statementDescriptor: null || 'Swirepay',
			paymentMethodType: [
				"CARD",
			],
			paymentMethodGid,
		}),
	};
	const response = await fetch(url, config);
	return await response.json();
}

export const createCard = async function (apiKey, name, cvv, number, expiryMonth, expiryYear, customerGid, save, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/payment-method`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify({
			card: {
				cvv,
				number,
				expiryMonth,
				expiryYear,
				name
			},
			type: "CARD",
			customerGid,
		}),
	};
	const response = await fetch(url, config);
	const result = await response.json();
	const gid = result && result.entity && result.entity.gid;
	const currencyCode = result && result.entity && result.entity.card && result.entity.card.currency.name;
	if (save) {
		await saveCard(apiKey, currencyCode, gid, test);
	}
	return await result;
}

export const findPaymentMethod = async function (apiKey, paymentMethodGid, test) {
	const gateway = getEndpoints(test).gateway;
	let url = `${gateway}/v1/payment-method/${paymentMethodGid}`;
	const config = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
	};
	const response = await fetch(url, config);
	return await response.json();
}

export const createCardPayment = async function (apiKey, amount, email, name, phone, test = false, paymentMethodGid, cardName, cardNumber, cardExpiryMonth, cardExpiryYear, cardCvv, save) {
	let customerGid;
	const gateway = getEndpoints(test).gateway;
	const data = await findCustomer(apiKey, name, email, phone, test);
	if (data.entity && data.entity.content[0] && data.entity.content[0].gid) {
		customerGid = data.entity && data.entity.gid;
	} else {
		const data = await createCustomer(apiKey, name, email, phone, test);
		customerGid = data.entity && data.entity.gid;
	}
	let result;
	if (!paymentMethodGid) {
		result = await createCard(apiKey, cardName, cardCvv, cardNumber, cardExpiryMonth, cardExpiryYear, customerGid, save, test);
	} else {
		result = await findPaymentMethod(apiKey, paymentMethodGid, test);
	}
	const gid = result && result.entity && result.entity.gid;
	const receiptEmail = (result.entity.card && result.entity.card.customer && result.entity.card.customer.email);
	const receiptSms = (result.entity.card && result.entity.card.customer && result.entity.card.customer.phoneNumber);
	const currencyCode = result && result.entity && result.entity.card && result.entity.card.currency.name;
	const postData = {
		amount,
		captureMethod: "AUTOMATIC",
		confirmMethod: "AUTOMATIC",
		currencyCode,
		description: "Online Payment",
		paymentMethodGid: gid,
		paymentMethodType: ["CARD"],
		receiptEmail: receiptEmail || null,
		receiptSms: receiptSms || null,
		statementDescriptor: "IND Test Payment"
	};

	const url = `${gateway}/v1/payment-session`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify(postData),
	};
	const res = await fetch(url, config);
	return await res.json();
}

export const createUpiPayment = async function (apiKey, amount, email, name, phone, test = false, paymentMethodGid, vpa) {
	let customerGid;
	const gateway = getEndpoints(test).gateway;
	const data = await findCustomer(apiKey, name, email, phone, test);
	if (data.entity && data.entity.content[0] && data.entity.content[0].gid) {
		customerGid = data.entity && data.entity.gid;
	} else {
		const data = await createCustomer(apiKey, name, email, phone, test);
		customerGid = data.entity && data.entity.gid;
	}
	let result;
	if (!paymentMethodGid) {
		result = await createUpi(apiKey, customerGid, vpa, test);
	} else {
		result = await findPaymentMethod(apiKey, paymentMethodGid, test);
	}
	const gid = result && result.entity && result.entity.gid;
	const receiptEmail = (result && result.entity && result.entity.upi && result.entity.upi.customer && result.entity.upi.customer.email);
	const receiptSms = (result && result.entity && result.entity.upi && result.entity.upi.customer && result.entity.upi.customer.phoneNumber);
	const currencyCode = result && result.entity && result.entity.upi && result.entity.upi.currency && result.entity.upi.currency.name;
	const postData = {
		amount,
		captureMethod: "AUTOMATIC",
		confirmMethod: "AUTOMATIC",
		currencyCode: currencyCode || "INR",
		description: "Online Payment",
		paymentMethodGid: gid,
		paymentMethodType: ["UPI"],
		receiptEmail: receiptEmail || null,
		receiptSms: receiptSms || null,
		statementDescriptor: "IND Test Payment"
	};

	const url = `${gateway}/v1/payment-session`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify(postData),
	};
	const res = await fetch(url, config);
	return await res.json();
}

export const createNetBanking = async function (apiKey, amount, email, name, phone, test = false, paymentMethodGid, bankGid) {
	let customerGid;
	const gateway = getEndpoints(test).gateway;
	const data = await findCustomer(apiKey, name, email, phone, test);
	if (data.entity && data.entity.content[0] && data.entity.content[0].gid) {
		customerGid = data.entity && data.entity.gid;
	} else {
		const data = await createCustomer(apiKey, name, email, phone, test);
		customerGid = data.entity && data.entity.gid;
	}
	let result;
	if (!paymentMethodGid) {
		result = await createBank(apiKey, customerGid, bankGid, test);
	} else {
		result = await findPaymentMethod(apiKey, paymentMethodGid, test);
	}
	const gid = result && result.entity && result.entity.gid;
	const receiptEmail = (result && result.entity && result.entity.upi && result.entity.upi.customer && result.entity.upi.customer.email);
	const receiptSms = (result && result.entity && result.entity.upi && result.entity.upi.customer && result.entity.upi.customer.phoneNumber);
	const currencyCode = result && result.entity && result.entity.upi && result.entity.upi.currency && result.entity.upi.currency.name;
	const postData = {
		amount,
		captureMethod: "AUTOMATIC",
		confirmMethod: "AUTOMATIC",
		currencyCode: currencyCode || "INR",
		description: "Online Payment",
		paymentMethodGid: gid,
		paymentMethodType: ["NET_BANKING"],
		receiptEmail: receiptEmail || null,
		receiptSms: receiptSms || null,
		statementDescriptor: "IND Test Payment"
	};

	const url = `${gateway}/v1/payment-session`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify(postData),
	};
	const res = await fetch(url, config);
	return await res.json();
}

export const createQRPayment = async function (apiKey, amount, email, name, phone, test = false, paymentMethodGid, vpa) {
	let customerGid;
	const gateway = getEndpoints(test).gateway;
	const data = await findCustomer(apiKey, name, email, phone, test);
	if (data.entity && data.entity.content[0] && data.entity.content[0].gid) {
		customerGid = data.entity && data.entity.gid;
	} else {
		const data = await createCustomer(apiKey, name, email, phone, test);
		customerGid = data.entity && data.entity.gid;
	}
	let result;
	if (!paymentMethodGid) {
		result = await createQR(apiKey, customerGid, vpa, test);
	} else {
		result = await findPaymentMethod(apiKey, paymentMethodGid, test);
	}
	const gid = result && result.entity && result.entity.gid;
	const receiptEmail = (result && result.entity && result.entity.upi && result.entity.upi.customer && result.entity.upi.customer.email);
	const receiptSms = (result && result.entity && result.entity.upi && result.entity.upi.customer && result.entity.upi.customer.phoneNumber);
	const currencyCode = result && result.entity && result.entity.upi && result.entity.upi.currency && result.entity.upi.currency.name;
	const postData = {
		amount,
		captureMethod: "AUTOMATIC",
		confirmMethod: "AUTOMATIC",
		currencyCode: currencyCode || "INR",
		description: "Online Payment",
		paymentMethodGid: gid,
		mrn: gid,
		paymentMethodType: ["UPI"],
		receiptEmail: receiptEmail || null,
		receiptSms: receiptSms || null,
		statementDescriptor: "IND Test Payment"
	};

	const url = `${gateway}/v1/payment-session`;
	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
		body: JSON.stringify(postData),
	};
	const res = await fetch(url, config);
	return await res.json();
}

export const getPaymentLink = async function (apiKey, amount, fee, currency, description, redirectUri, test = false) {
	const gateway = getEndpoints(test).gateway;
	const config = {
		method: 'POST',
		headers: {},
	};
	const body = {
		amount,
		currencyCode: currency,
		paymentMethodType: [
			"CARD"
		],
		redirectUri,
		description,
		applicationFee: fee
	};
	config.body = JSON.stringify(body);
	config.headers['Content-Type'] = 'application/json';
	config.headers['x-api-key'] = apiKey;
	const url = `${gateway}/v1/payment-link`;
	const response = await fetch(url, config);
	const data = await response.json();
	window.location.href = data.entity.link;
}

export const createPartnerAccount = async function (key, redirectUrl) {
	window.location.href = `https://staging-secure.swirepay.com/connect?key=${key}&redirectUrl=${redirectUrl}`;
}
