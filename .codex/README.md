# MCP arody

Configuración de Codex exclusiva de este proyecto. El MCP accede a la instancia
Supabase del VPS; no está restringido al esquema `oniria` por el servidor.

En este Mac, el agente `~/Library/LaunchAgents/cloud.arody.oniria-mcp.plist`
mantiene un túnel SSH desde `127.0.0.1:18080` hacia `127.0.0.1:8080` del VPS.
Se inicia al entrar a la sesión de macOS y se reconecta si pierde la conexión.
Usa una llave exclusiva en `~/.ssh/oniria_mcp_ed25519`, limitada en el VPS al
destino del túnel y sin acceso a una shell. No requiere guardar la contraseña.

Comprobar la conexión:

```sh
curl --fail --max-time 15 http://127.0.0.1:18080/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"oniria-check","version":"1"}}}'
```

En el VPS, Studio publica su puerto solo en loopback. Nginx bloquea `/api/mcp`
y sirve el panel a través de Kong con las credenciales existentes
`DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` de Supabase. Kong conserva su bloqueo
público del MCP. Respaldo previo: `/root/oniria-mcp-backup-20260908-201730`.

El túnel y la llave son locales a este Mac; clonar el proyecto no los instala.
