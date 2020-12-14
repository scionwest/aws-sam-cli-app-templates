import 'mocha';
import { expect } from 'chai';
import { Mock, It, Times } from 'moq.ts';
import { DynamoDB } from 'aws-sdk';

import { GetByIdApp } from '../../src/apps/get-by-id-app';
import { TodoItem } from '../../src/models/todo-item';
import { TodoRepository } from '../../src/models/todo-repository';
import { ApiGatewayResponse } from '../../src/models/apigateway/apigateway-response';
import { ApiGatewayEventMock } from '../models/apigateway-event-mock';

describe('PostApp instance', () => {
    const tableName = 'MY_TABLE';
    const repoMock = new Mock<TodoRepository>()
        .setup(instance => instance.putTodo(It.IsAny(), tableName))
        .returns(new Promise<void>((resolve) => { resolve(); }));
        
    describe('constructor', () => {
        
        it('table is assigned', () => {
            const app = new GetByIdApp(tableName, repoMock.object());
            
            expect(app.table).to.equal(tableName);
        });
        
        it('repository is assigned', () => {
            const app = new GetByIdApp(tableName, repoMock.object());
            
            expect(app.repository).to.equal(repoMock.object());
        });
    });
    
    describe('run', () => {
        it('path parameter missing "id" returns 404 status code', async () => {
            const event = new ApiGatewayEventMock();
            
            const app = new GetByIdApp(tableName, repoMock.object());
            const response: ApiGatewayResponse = await app.run(event);
            
            expect(response).to.have.property('statusCode');
            expect(response.statusCode).to.equal(404);
        });
        
        it('repository is called to get a record by id', async () => {
            const todo: TodoItem = { id: "123", title: "hello world", isComplete: true };
            const mock = new Mock<TodoRepository>()
                .setup(instance => instance.getById(It.IsAny(), tableName))
                .returns(new Promise<TodoItem>((resolve) => { 
                    resolve(todo);
                }));
                
            const event = new ApiGatewayEventMock();
            event.pathParameters = { id: todo.id };

            const app = new GetByIdApp(tableName, mock.object());
            const response: ApiGatewayResponse = await app.run(event);
            
            mock.verify(instance => instance.getById(It.IsAny(), tableName), Times.Once());
        });
    });
});