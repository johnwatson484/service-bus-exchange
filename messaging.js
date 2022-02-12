const { ServiceBusAdministrationClient } = require('@azure/service-bus')

const getEntities = async (connectionString) => {
  console.log(connectionString)
  const serviceBusAdministrationClient = new ServiceBusAdministrationClient(connectionString)
  const queues = []
  for await (const queue of serviceBusAdministrationClient.listQueues()) {
    queues.push(queue)
  }
  const topics = []
  for await (const topic of serviceBusAdministrationClient.listTopics()) {
    topics.push(topic)
  }
  const subscriptions = []
  for await (const subscription of serviceBusAdministrationClient.listSubscriptions()) {
    subscriptions.push(subscription)
  }
  return {
    queues,
    topics,
    subscriptions
  }
}

module.exports = {
  getEntities
}
