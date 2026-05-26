import { useState } from 'react'
import { ServerIcon, CheckIcon, SpeedIcon, LockIcon } from './Icons'

const ServerList = ({ servers, selectedServer, onSelectServer }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (server.protocol && server.protocol.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  const getSpeedColor = (speed) => {
    if (speed >= 80) return 'text-green-400'
    if (speed >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  const getProtocolBadge = (protocol) => {
    const colors = {
      vless: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      vmess: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      trojan: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      shadowsocks: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      hysteria2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      tuic: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    }
    return colors[protocol?.toLowerCase()] || 'bg-white/10 text-white/60 border-white/20'
  }
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск сервера по названию, стране или протоколу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-modern"
        />
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredServers.map((server) => (
          <button
            key={server.id}
            onClick={() => onSelectServer(server)}
            className={`w-full p-4 rounded-xl transition-all duration-300 ${
              selectedServer?.id === server.id
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            } border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${
                  selectedServer?.id === server.id
                    ? 'bg-cyan-500'
                    : 'bg-white/10'
                }`}>
                  <ServerIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="font-semibold text-white truncate">{server.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-sm text-white/60">{server.country}</p>
                    {server.protocol && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getProtocolBadge(server.protocol)}`}>
                        {server.protocol.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <div className="flex items-center space-x-1">
                  <SpeedIcon className={`w-4 h-4 ${getSpeedColor(server.speed)}`} />
                  <span className={`text-sm font-medium ${getSpeedColor(server.speed)}`}>
                    {server.speed}%
                  </span>
                </div>
                {selectedServer?.id === server.id && (
                  <CheckIcon className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-8 text-white/60">
          <ServerIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Серверы не найдены</p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-2 text-cyan-400 hover:text-cyan-300"
            >
              Сбросить поиск
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ServerList
