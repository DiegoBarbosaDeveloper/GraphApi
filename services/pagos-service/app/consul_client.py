import os
import consul

def register_service():
    consul_host = os.environ.get('CONSUL_HOST', 'localhost')
    c = consul.Consul(host=consul_host, port=8500)
    
    service_name = 'pagos-service'
    service_port = int(os.environ.get('PORT', 3004))
    
    c.agent.service.register(
        name=service_name,
        address='pagos-service',
        port=service_port,
        check=consul.Check.http(
            f'http://pagos-service:{service_port}/health',
            interval='10s',
            timeout='5s'
        )
    )
    print(f'{service_name} registrado en Consul')
