
export const validateUsername = username => {
	if (!username) return false;
	return /(^([a-z])[a-z0-9_]{5,30})$/i.test(username);
};

export const validatePassword = password => {
	if (!password) return false;
	const validLength = password.length >= 14;
	const hasLowercaseCharacters = /[a-z]+/g.test(password);
	const hasUppercaseCharacters = /[A-Z]+/g.test(password);
	const hasNumbers = /[0-9]+/gi.test(password);
	return validLength &&
		hasLowercaseCharacters &&
		hasUppercaseCharacters &&
		hasNumbers;
};

export const validateEmail = email => {
	if (!email) return false;
	return /^[a-z0-9][a-z0-9_.\--.]+@([a-z-]+\.)+[a-z-]{2,4}$/gi.test(email);
};

export default {
	validateUsername,
	validatePassword,
	validateEmail,
};