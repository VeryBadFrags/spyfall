.PHONY: dev
dev: run_server run_client

.PHONY:run_server
run_server:
	@make -C spyfall-server dev

.PHONY:run_client
run_client:
	@make -C spyfall-client dev
