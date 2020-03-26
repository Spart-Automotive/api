const messages = {
	somethingWentWrong: {
    	message: 'Something Went Wrong.'
	},
	noAccessToken: {
    	message: 'No Access Token Provided.'
	},
	invalidToken: {
    	message: 'Invalid Token.'
	},
	validationError: {
    	message: 'Validation Error.'
	},
	unauthorizedAccess: {
    	message: 'Unauthorized Access.'
	},
	// Section
	sectionNotFound: {
    	message: 'Section Not Found.'
	},
	noFileSelected: {
    	message: 'No File Selected.'
	},
	noSectionImageFound: {
		message: 'No Section Image Found'
	},
	sectionExists: {
    	message: 'Section Name cannot be dublicated.'
	},
}

const prepareError = (key, details) => {
	return {
		details,
		key,
		message: messages[key].message,
		code: Object.keys(messages).indexOf(key)
	}
}

const gripError = (key, details = {}) => {
	if (messages[key]) return prepareError(key, details)
	return prepareError('somethingWentWrong', details)	
}

const deliverError = (res, status, key, details) => {
	return res.status(status).send(gripError(key, details))
}



module.exports = deliverError