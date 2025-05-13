import Ajv from "ajv";
import { faker } from '@faker-js/faker';

import { genData, generateUpdatedData,generatePartialUpdate} from '../support/generateData';

const ajv = new Ajv({ allErrors: true, verbose: true }); 
const data = genData();
const updated_data = generateUpdatedData(data);
const partial_update = generatePartialUpdate();


describe('Restful booker Api testing', () =>{  
  // Переменные для хранения токена авторизации и ID созданного бронирования
  let authToken = null
  let id = null
   // Получаем токен авторизации перед выполнением тестов, где он нужен
  before('Get token fo delete, update and put operations', () => {
    cy.request({
      method: 'POST',
      url: 'https://restful-booker.herokuapp.com/auth',
      headers: {
            "Content-Type": "application/json",
          },
      body: {
        username: Cypress.env('username'),
        password: Cypress.env('password')
        }  
      }).then((response) => {
        expect(response.status).to.eq(200)    // Проверка успешного ответа
        expect(response.body.token).to.exist  // Проверка, что токен получен
        authToken = response.body.token       // Сохраняем токен для последующих запросов
      })
    });


    it('Authorize valid and invalid login/password pairs', () => {
      cy.fixture('authdata').then((testCases) => {
        testCases.forEach((testCase) => {
          cy.request({
            method: 'POST',
            url: 'https://restful-booker.herokuapp.com/auth',
            failOnStatusCode: false, // не сбрасываем тест при 4xx/5xx
            body: {
              username: testCase.username,
              password: testCase.password
            }
          }).then((response) => {
            if (testCase.valid) {
              expect(response.status).to.eq(200);
              expect(response.body.token).to.exist;
            } else {
              expect(response.status).to.eq(200); // этот API всегда возвращает 200 даже при ошибке
              expect(response.body).to.have.property('reason');
              expect(response.body.reason).to.eq('Bad credentials');
            }
          });
        });
      });
    });
  

    // Тест: создание нового бронирования
    it('Create booking', () => {
      cy.allure().feature('Booking Management')
      cy.allure().story('Create a new booking')
      cy.allure().severity('critical')
      cy.allure().description('Создание нового бронирования с валидными данными')
      cy.allure().tag('positive')
      
      cy.request({
        method: 'POST',
        url: 'https://restful-booker.herokuapp.com/booking',
    
        headers: {
            "Content-Type": "application/json"
          },
        body: data
      }).then((response) => {
        expect(response.status).to.eq(200)                            // Проверка успешного ответа
        expect(response.body.booking.firstname).to.eq(data.firstname) // Проверка, что имя совпадает
        id = response.body.bookingid                                  // Сохраняем ID созданного бронирования
        cy.validateResponseSchema('POST', '/booking', response);     // Проверка по JSON-схеме
    });
    })

    // Тест: получить созданное бронирование
    it('Get created booking', () => {  
      cy.allure().feature('Booking Management')
      cy.allure().story('Get created booking')
      cy.allure().severity('critical')
      cy.allure().description('Получение бронирования')
      cy.allure().tag('positive')
      
      cy.request({
        method: 'GET',
        url: 'https://restful-booker.herokuapp.com/booking/'+id,
    
        headers: {
            "Content-Type": "application/json"
          }
      }).then((response) => {
        expect(response.status).to.eq(200)                      // Проверка успешного ответа
        expect(response.body.firstname).to.eq(data.firstname)   // Проверка, что имя совпадает
        cy.validateResponseSchema('GET', '/booking', response); // Проверка по JSON-схеме   
    });
    })

     // Тест: обновить всё бронирование
    it('Update created booking', () => {  
      cy.allure().feature('Booking Management')
      cy.allure().story('Update created booking')
      cy.allure().severity('critical')
      cy.allure().description('Полное обновление бронирования')
      cy.allure().tag('positive')
      cy.request({
        method: 'PUT',
        url: 'https://restful-booker.herokuapp.com/booking/'+id,
    
        headers: {
            "Content-Type": "application/json",
            "Cookie": "token="+authToken        // Авторизация через cookie
          },
        body: updated_data

      }).then((response) => {
        expect(response.status).to.eq(200)                               // Проверка успешного ответа
        expect(response.body.totalprice).to.eq(updated_data.totalprice) // Проверка обновлённой цены
        cy.validateResponseSchema('PUT', '/booking', response);         // Проверка по JSON-схеме   
    });
    })

    // Тест: частичное обновление (PATCH)
    it('Partial update created booking', () => {  
      cy.allure().feature('Booking Management')
      cy.allure().story('Partial update created booking')
      cy.allure().severity('critical')
      cy.allure().description('Полное обновление бронирования')
      cy.allure().tag('positive')
      cy.request({
        method: 'PATCH',
        url: 'https://restful-booker.herokuapp.com/booking/'+id,
    
        headers: {
            "Content-Type": "application/json",
            "Cookie": "token="+authToken
          },
        body: partial_update

      }).then((response) => {
        expect(response.status).to.eq(200)                              // Проверка успешного ответа
        expect(response.body.firstname).to.eq(partial_update.firstname) // Проверка обновлённого имени
        expect(response.body.lastname).to.eq(partial_update.lastname)   // Проверка обновлённой фамилии
        cy.validateResponseSchema('PATCH', '/booking', response);       // Проверка по JSON-схеме   
    });
    })

    // Тест: получить список всех ID бронирований
    it('Get all booking ids', () => {
      cy.allure().feature('Booking Management')
      cy.allure().story('Get all ids booking')
      cy.allure().severity('Minor')
      cy.allure().description(' Получение списка всех ID бронирований')
      cy.allure().tag('positive')

      cy.request({
        method: 'GET',
        url: 'https://restful-booker.herokuapp.com/booking/',
    
        headers: {
            "Content-Type": "application/json"
          }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array');

        const bookingIds = response.body.map(b => b.bookingid);
        cy.task('logIds', bookingIds);
        expect(bookingIds).to.include(id);    // Проверяем, что наш ID присутствует в списке  
      });
    })
  

    // Тест: удаление бронирования
    it('Delete created booking by auth user', () => { 
      cy.allure().feature('Booking Management')
      cy.allure().story('Delete booking')
      cy.allure().severity('Minor')
      cy.allure().description(' Удаление бронирования')
      cy.allure().tag('positive')
          cy.request({
            method: 'DELETE',
            url: 'https://restful-booker.herokuapp.com/booking/'+id,        
            headers: {
                "Content-Type": "application/json",
                "Cookie": "token="+authToken
              }
          }).then((response) => {
            expect(response.status).to.eq(201) // Проверка успешного ответа
          })
  });
});


// Команда запуска из CLI:
//npx cypress run --spec cypress/e2e/restfulbooker.cy.js --env allure=true

// Для отчета:
//npx allure generate allure-results -o allure-report
//allure open allure-report