const { v4: uuidv4 } = require('uuid')
const Store = require('electron-store')

const connectionStore = new Store({
  name: 'connections',
  defaults: {
    connections: []
  }
})

const getConnections = () => {
  return connectionStore.get('connections') ?? []
}

const addConnection = (connection) => {
  const existingConnections = getConnections()
  existingConnections.push(connection)
  connectionStore.set('connections', existingConnections)
  addConnectionToView(connection)
}

const deleteConnection = (id) => {
  const existingConnections = getConnections()
  const updatedConnections = existingConnections.filter(x => x.id !== id)
  connectionStore.set('connections', updatedConnections)
  deleteConnectionFromView(id)
}

const addConnectionToView = (connection) => {
  holder.insertAdjacentHTML('beforeend', `
    <div class="connection-item" id="connection-item-${connection.id}">
      <p class="text-sm" id="connection-header-${connection.id}" style="cursor: pointer;"><i class="fa-solid fa-arrow-right-arrow-left"></i> ${connection.name}</p>
      <button class="btn btn-danger btn-sm" id="delete-connection-${connection.id}" data-id=${connection.id}><i class="fa-solid fa-minus"></i></button>
    </div>`)
  document.getElementById(`delete-connection-${connection.id}`).addEventListener('click', () => deleteConnection(connection.id))
}

const deleteConnectionFromView = (id) => {
  const connection = document.getElementById(`connection-item-${id}`)
  connection.remove()
}

document.getElementById('add-connection-confirm').addEventListener('click', () => {
  const name = document.getElementById('add-connection-name')
  const connectionString = document.getElementById('add-connection-string')

  if (name.value !== '' && connectionStore.value !== '') {
    const connection = {
      id: uuidv4(),
      name: name.value,
      connectionString: connectionString.value
    }
    addConnection(connection)
    name.value = ''
    connectionString.value = ''
    const connectionModal = document.querySelector('#add-connection-modal')
    const modal = bootstrap.Modal.getInstance(connectionModal)
    modal.hide()
  }
})

const holder = document.getElementById('connection-holder')
const connections = getConnections()

connections.forEach(connection => {
  addConnectionToView(connection)
})