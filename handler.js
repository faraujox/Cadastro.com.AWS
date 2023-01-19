'use strict';
const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: 'LIVRARIA'
}

module.exports.getAllBooks = async (event) => {
  try{
    let data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  }catch(err){
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Falha na pesquisa"
      })
    }
  }
};

module.exports.postBooks = async (event) => {
  try{
    let data = JSON.parse(event.body);
    const { order_id, attributes } = data

    const newData = {
      id: uuidv4(),
      order_id: order_id,
      attributes: attributes
    }

    await dynamoDb.put({
      TableName: "LIVRARIA",
      Item: newData
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({message: "Livro cadastrado com sucesso!"}),
    };
  }catch(err){
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Falha na pesquisa"
      })
    }
  }
};

module.exports.getBooks = async (event) => {
  try{
    const {id} = event.pathParameters;
    const data = await dynamoDb.get({...params, Key:{id: id}}).promise();

    if (!data.Item) {
      return{ 
        statusCode: 404,
        body: JSON.stringify({error: 'Livro não cadastrado.'}, null, 2)
      }
    }

    const result = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(result, null, 2),
    };
  }catch(err){
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Falha na pesquisa"
      })
    }
  }
};

module.exports.deleteBooks = async (event) => {
  try{
    const {id} = event.pathParameters;
    const data = await dynamoDb.delete({...params, Key:{id: id},
      ConditionExpression: 'attribute_exists(id)'
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({message: "Livro excluído com sucesso!"}),
    };
  }catch(err){
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Falha na pesquisa"
      })
    }
  }
};

module.exports.updateBooks = async (event) => {
  try{
    const {id} = event.pathParameters;
    let data = JSON.parse(event.body);

    const { order_id, attributes } = data;
    
    await dynamoDb.update({...params, Key:{id: id},
      UpdateExpression: 'SET order_id = :order_id, attributes = :attributes',
      ConditionExpression: 'attribute_exists(id)',
      ExpressionAttributeValues: {
        ':order_id': order_id,
        ':attributes': attributes
      }
    }).promise();
    
    const updatedData = await dynamoDb.get({...params, Key:{id: id}}).promise();
    const result = updatedData.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  }catch(err){
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Falha na pesquisa"
      })
    }
  }
};
