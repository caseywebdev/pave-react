BIN=node_modules/.bin/
COGS=$(BIN)cogs

dev:
	@npm install
	@$(COGS) -w pave-react.es6
