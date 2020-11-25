#ДОЙТИ ДО ПЛАТЕЖА

#Questions for Greg

2. What about making a cart, where reserved (but not bought events) could save;


#About reserve
//1. Reserve event ->
//2. Push it to the collection of "Recent Reserved Events" (or Create, then push) by id
//3. The scheduled function would check only this folder.

##Refactor
1. Переделать клауд функцию в композиционную (optional) 
2. В сервисах то же самое (data.service) (optional)
3. Узнать за возможную корзину для пользователя, который зарезервировал билет, но ещё его не оплатил.
//4. Какой выбор дат должен быть у клиента

##Bugs and improvements
1. Chat between user is lagging.
2. We can add possibility to cancel event through implementing a request to customer from coach
3. Can be added a notification about deadline for payment for reserved course;

##Global
0.1. Remove all console.logs;
0.2. Make all modals;
0.3. Make Algolia available again.
1. Make unavailable to reserve a session before 8 hours of it start --do after testing
//2. Make unavailable to change session\break duration, if Coach has some sessions OR left it, if 3. 
3. Make title for each session (maybe it would be better, if it will be a select from the Coach's
    course list)                                                    --do as improvement
//4. Make Select for day to reserve --COULD BE IMPROVED BY ADDING A WEEK SELECT (MONTH, etc.)
5. Add "bought" class for Calendar Event and methods to buy.
6. Make CRON which will delete all outdated events 
7. Make select for sessions choose (by courses, like Math and Programming - 1 hour and 1.5 hour);
8. Add data range to events in data.service.ts 579 (so, We should add a select also)

##Todos
//1. Пофиксить разницу во времени между "сейчас" и когда зарегали задачу.
//2. Поиск и добавление определённых свойств (точнее удаление "reserved && reservedBy & timeStamp")
//3. Удаление данной таски из таблицы,если она вкатывает в условие.
//4. Посмотреть, почему 
//5. Как удалять её, если в таблице (юзера) её нет.
//6. If user didn't log in - remove listener from "Get a Call" button
//9. Select and so on for choosing the time of session
//10. Протестить ещё раз облачную  (может date.now() привязана к поясам)
//11. Забанить пользователю смену сессии\паузы (для этого написать метод, который просто чекает, 
есть ли у пользователя коллекция календарь).


test access token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2M5ZTkyMjZhNTFjMDU0ZTUxMDk4ZGJmY2Y1OGQzMjhhLTE2MDU1Mjk5NTUiLCJpc3MiOiJTS2M5ZTkyMjZhNTFjMDU0ZTUxMDk4ZGJmY2Y1OGQzMjhhIiwic3ViIjoiQUMwZmJmOTNlMjk5Y2UyOWZjNWJlNDg5MzRiYWVkMmEyZiIsImV4cCI6MTYwNTUzMzU1NSwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiTGl2ZWNvYWNoIiwidmlkZW8iOnt9fX0.m8XcxevbUFiFEaAltLOzpqzbA7DV8Pd69EbZWVtvQrc

## 17.11
1. Try to give an access token to at least 2 users.
2. Cloud function refactor for generating tokens
3. Serve for static ip and try to call 


yarn start --ssl true --ssl-key D:\greg-project\certificates\localhost.key --ssl-cert D:\greg-project\certificates\localhost.crt --host 192.168.0.110 --port 4200


##19.11
1. ngOnDestroy () for video component
2. styles for vide-component 
3. getToken through CLoud Function
4. about Controlling time, etc. in user Room
5. Hide up all inputs in vide-component
6. Figure out interaction between the client, DB and API. 
7. Time to Live for access token (чекнуть как оно работает).

### additional
1. Исправить прикол: Если сессии свободны только на один день  они нормально не отображаются в модалке
1. Recording calls

разобраться как юзать

chatClient.on('tokenAboutToExpire', function() {
  // Implement fetchToken() to make a secure request to your backend to retrieve a refreshed access token.
  // Use an authentication mechanism to prevent token exposure to 3rd parties.
  fetchToken(function(updatedToken) {
    chatClient.updateToken(updatedToken);
  });
});



// Повешать, чтобы отключать при закрытии (|| window.onunload )
window.onbeforeunload = function() {
    return "Данные не сохранены. Точно перейти?";
  };

/в ручную исправить базу потом
/добавить в календарь.компонент свойства ordered, orderedBy. Пофиксить ситуацию с title и добавить кастомный класс на ordered ( green );
/Сделать все модалки, исправить в видео.компоненте (html) всё.
## За неделю
1. Добавлено правило на чтение\запись в клауд файрстор (ordered-sessions)
2. Создана VideoPage 

## Что я сделал за сегодня
1. Reserved-sessions component added. (route: /reserved-sessions). The same as cart for reserved events.
2. Несколько функций в firebase для вытаскивания зарезервированных, но ещё не купленных ивентов
3. 
