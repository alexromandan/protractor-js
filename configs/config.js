
'use strict';
require('babel-register');

const testPath = __dirname.replace('configs', 'tests');
const globalConfig = require('./config.global');

globalConfig.config.specs = [
	`${testPath}/*.spec.js`
];

const {setConfig} = require('./setMultiConfig');
const cfg = setConfig(globalConfig);

if (process.env.directConnect)
	cfg.config.directConnect = process.env.directConnect;

module.exports = cfg;