// created by Leonard Pauli, 13 mar 2018

const express = require('express')
const app = express()

const levelup = require('levelup')
const encode = require('encoding-down')
const leveldown = require('leveldown')

const Gun = require('gun')
require('gun-level-lptmp')

// config
const config = {
	port: process.env.PORT || 3000,
}

// serve public
app.use(express.static(__dirname + '/public', {
	extensions: ['html', 'htm'],
}))
const server = app.listen(config.port)

// Create a new level instance which saves
// to the `data/` folder.
const levelDB = levelup(
	encode(leveldown('data/level'), {
		valueEncoding: 'json',
	})
)

// setup server
// const http = require('http')
// const server = http.createServer().listen(port)

// setup gun
const gun = new Gun({
	level: levelDB,
	// file: 'data/pure.json',
	localStorage: false,
	radisk: false,
	web: server,
})
