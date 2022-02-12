const { v4: uuidv4 } = require('uuid')
const Store = require('electron-store')
const { getEntities } = require('../messaging')

const connectionStore = new Store({
  name: 'connections',
  defaults: {
    connections: []
  }
})

const getConnections = () => {
  return connectionStore.get('connections') ?? []
}

const getConnectionById = (id) => {
  return getConnections().find(x => x.id === id)
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
      <h6 id="connection-header-${connection.id}" style="cursor: pointer;"><i class="fa-solid fa-arrow-right-arrow-left"></i>    ${connection.name}</h5>
      <button class="btn btn-danger btn-xs" id="delete-connection-${connection.id}" data-id=${connection.id} style="display:none; margin-bottom:20px;"><i class="fa-solid fa-minus"></i></button>
      <div id="connection-detail-${connection.id}" style="display:none;">
        <h6 id="queues-header-${connection.id}">Queues</h6>
        <ul id="queues-list-${connection.id}" style="list-style-type:none;"></ul>
        <h6 id="topics-header-${connection.id}">Topics</h6>
        <ul id="topics-list-${connection.id}" style="list-style-type:none;"></ul>
        <h6 id="subscriptions-header-${connection.id}">Subscriptions</h6>
        <ul id="subscriptions-list-${connection.id}" style="list-style-type:none;"></ul>
      </div>
    </div>`)
  document.getElementById(`delete-connection-${connection.id}`).addEventListener('click', () => deleteConnection(connection.id))
  document.getElementById(`connection-header-${connection.id}`).addEventListener('click', async () => { await toggleEntities(connection) })
}

const deleteConnectionFromView = (id) => {
  const connection = document.getElementById(`connection-item-${id}`)
  connection.remove()
}

const toggleEntities = async (connection) => {
  const details = document.getElementById(`connection-detail-${connection.id}`)
  const deleteButton = document.getElementById(`delete-connection-${connection.id}`)

  if(details.style.display === 'none') {
    const { queues, topics, subscriptions } = await getEntities(connection.connectionString)
    details.style.display = 'block'
    deleteButton.style.display = 'block'
    addEntitiesToConnection(connection, queues, 'queue')
    addEntitiesToConnection(connection, topics, 'topic')
    addEntitiesToConnection(connection, subscriptions, 'subscription')
  } else {
    details.innerHTML = ''
    details.style.display = 'none'
    deleteButton.style.display = 'none'
  }
}

const addEntitiesToConnection = (connection, entities, type) => {
  for (const entity of entities) {
    const list = document.getElementById(`${type}s-list-${connection.id}`)
    list.insertAdjacentHTML('beforeend', `
      <li id="${type}-${connection.id}-${entity.name}" style="cursor: pointer;"><i class="fa-solid fa-diagram-project"></i>    ${entity.name}</li>`)
  }
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
