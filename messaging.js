const { ServiceBusAdministrationClient } = require('@azure/service-bus')

const getEntities = async (connectionString) => {
  const serviceBusAdministrationClient = new ServiceBusAdministrationClient(connectionString)
  const queues = []
  for await (const queue of serviceBusAdministrationClient.listQueues()) {
    queues.push(queue)
  }
  const topics = []
  for await (const topic of serviceBusAdministrationClient.listTopics()) {
    topic.subscriptions = []
    for await (const subscription of serviceBusAdministrationClient.listSubscriptions(topic.name)) {
      topic.subscriptions.push(subscription)
    }
    topics.push(topic)
  }
  return {
    queues,
    topics
  }
}

module.exports = {
  getEntities
}
