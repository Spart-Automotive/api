const jwt = require('jsonwebtoken')
const config = require('../config')
const hasRole = require('./hasRole')
const deliverError = require('../resources/errors')

module.exports = function(roles = null) {
	return function (req, res, next) {
		const token = req.header('Authorization')
		if (!token) return deliverError(res, 401, 'noAccessToken')

		try {
			const decoded = jwt.verify(token, config.jwtPrivateKey)
			req.user = decoded

			if(!hasRole(roles, decoded)) {
				return deliverError(res, 401, 'unauthorizedAccess')
			} else {
				next()
			}
		}
		catch (ex) {
			return deliverError(res, 401, 'invalidToken')
		}
	}
}