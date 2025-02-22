// @flow

const fs = require('fs')

// Parses a string of URIs like: "host:port,host:port..."
// into an array of objects like: [ { host: "host", port: "port" }]
function parseUris(urisStr /*: any */) /*: Array<{ host: string, port: number }> */ {
  if (typeof urisStr !== 'string') return []
  const uris = urisStr.split(',')
  const out = []
  for (let i = 0; i < uris.length; i++) {
    const [host, port] = uris[i].split(':')
    out.push({ host, port: parseInt(port, 10) })
  }
  return out
}

function getRelease() {
  try {
    return fs.readFileSync('VERSION.txt').toString().replace('\n', '')
  } catch (err) {
    return 'development'
  }
}

const RELEASE = getRelease()
const LOGGING_LABEL = process.env.LOGGING_LABEL || 'kubesail-agent'

const config = {
  NODE_NAME: process.env.NODE_NAME || 'raspberrypi.local',

  // Common options:
  METRICS_LISTEN_PORT: parseInt(process.env.METRICS_LISTEN_PORT || 5000, 10),
  TLS_KEY_PATH: process.env.TLS_KEY_PATH || `${process.cwd()}/secrets/tls.key`,
  TLS_CERT_PATH: process.env.TLS_CERT_PATH || `${process.cwd()}/secrets/tls.crt`,
  TLS_CHAIN_PATH: process.env.TLS_CHAIN_PATH,

  // Logging options:
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOGGING_LABEL,
  PLAINTEXT_LOGGING: process.env.PLAINTEXT_LOGGING,
  RELEASE,

  // Gateway options:
  REDIS_SERVERS: parseUris(process.env.REDIS_SERVERS || 'kubesail-gateway-redis:6379'),
  GATEWAY_AGENT_LISTEN_PORT: parseInt(process.env.GATEWAY_HTTPS_LISTEN_PORT || 8000, 10), // Used for agents to register
  GATEWAY_HTTP_LISTEN_PORT: parseInt(process.env.GATEWAY_HTTP_LISTEN_PORT || 8080, 10), // Used for inbound http traffic
  GATEWAY_HTTPS_LISTEN_PORT: parseInt(process.env.GATEWAY_HTTPS_LISTEN_PORT || 8443, 10), // Used for inbound https traffic,
  INTERNAL_HTTPS_RESPONDER_PORT: 9000,
  KUBESAIL_API_SECRET: process.env.KUBESAIL_API_SECRET || 'KUBESAIL_API_SECRET',
  KUBESAIL_API_TARGET: process.env.KUBESAIL_API_TARGET || 'api.kubesail.com',
  GATEWAY_ADDRESS: process.env.GATEWAY_ADDRESS || 'kubesail-gateway.default.svc.cluster.local',
  LOG_FORMAT: `{"date":":date[iso]","addr":":remote-addr","status"::status,"method":":method","path":":url","responseTime"::response-time,"length"::res[content-length]}`,
  AGENT_LOG_FORMAT: process.env.AGENT_LOG_FORMAT || 'plain', // 'plain' or 'json'
  GATEWAY_INTERNAL_ADDRESS: process.env.GATEWAY_INTERNAL_ADDRESS,
  KUBESAIL_FIREWALL_WHITELIST: (
    process.env.KUBESAIL_FIREWALL_WHITELIST || '127.0.0.1/32,10.0.0.0/8'
  )
    .split(',')
    .filter(Boolean),

  // Agent Options:
  KUBESAIL_AGENT_USERNAME: process.env.KUBESAIL_AGENT_USERNAME,
  KUBESAIL_AGENT_KEY: process.env.KUBESAIL_AGENT_KEY,
  KUBESAIL_AGENT_EMAIL:
    process.env.KUBESAIL_AGENT_EMAIL || `blackhole+${process.env.KUBESAIL_AGENT_KEY}@kubesail.com`,
  KUBESAIL_AGENT_SECRET: process.env.KUBESAIL_AGENT_SECRET,
  KUBESAIL_AGENT_INITIAL_ID: process.env.KUBESAIL_AGENT_INITIAL_ID,
  KUBESAIL_AGENT_GATEWAY_TARGET: (
    process.env.KUBESAIL_AGENT_GATEWAY_TARGET || 'kubesail-gateway:8000'
  ).replace('https://', ''), // Used to register with the gateway

  INGRESS_CONTROLLER_NAMESPACE:
    process.env.INGRESS_CONTROLLER_NAMESPACE || 'ingress-nginx,kube-system,default',
  INGRESS_CONTROLLER_ENDPOINT:
    process.env.INGRESS_CONTROLLER_ENDPOINT ||
    'ingress-nginx-controller,traefik,ingress-nginx-controller,default',
  INGRESS_CONTROLLER_PORT_HTTP: parseInt(process.env.INGRESS_CONTROLLER_PORT_HTTP, 10) || 80,
  INGRESS_CONTROLLER_PORT_HTTPS: parseInt(process.env.INGRESS_CONTROLLER_PORT_HTTPS, 10) || 443,

  METRICS_SERVER_ENDPOINT: process.env.METRICS_SERVER_ENDPOINT || 'metrics-server',
  KUBESAIL_AGENT_HTTP_LISTEN_PORT: parseInt(
    process.env.KUBESAIL_AGENT_HTTP_LISTEN_PORT || 6000,
    10
  ), // Used for healthchecks internally on the agent cluster

  // ADDITIONAL_CLUSTER_HOSTNAMES allows the Agent to redirect alternative hostnames to the kube api instead of to the ingress controller
  ADDITIONAL_CLUSTER_HOSTNAMES: (process.env.ADDITIONAL_CLUSTER_HOSTNAMES || '').split(','),

  // Development options
  ALWAYS_VALID_DOMAINS: (process.env.ALWAYS_VALID_DOMAINS || '').split(',').filter(Boolean),

  DOCUMENTS_TO_WATCH: [
    { group: 'core', version: 'v1', kind: 'Namespace' },
    { group: 'apps', version: 'v1', kind: 'Deployment' },
    { group: 'core', version: 'v1', kind: 'Service' },
    { group: 'networking.k8s.io', version: 'v1', kind: 'Ingress' },
    { group: 'core', version: 'v1', kind: 'PersistentVolumeClaim' },
    { group: 'core', version: 'v1', kind: 'Pod' },
    { group: 'core', version: 'v1', kind: 'Secret' },
    { group: 'core', version: 'v1', kind: 'Endpoints' },
    { group: 'core', version: 'v1', kind: 'ConfigMap' },
    { group: 'apps', version: 'v1', kind: 'StatefulSet' },
    { group: 'batch', version: 'v1', kind: 'Job' },
    { group: 'batch', version: 'v1beta1', kind: 'CronJob' },
    { group: 'core', version: 'v1', kind: 'ReplicationController' }
  ],

  // Helpers
  getRelease,
  parseUris
}

const [KubeSailApiTarget, KubeSailApiPort] = config.KUBESAIL_API_TARGET.split(':')[0]
config.apiTarget = KubeSailApiTarget
config.apiPort = KubeSailApiPort

module.exports = config
