#arc_calendar
ArcCalendar is a dynamically generated JavaScript calendar that populates events via an AJAX call to your JSON API. 

ArcCalendar is intended for use by entertainment providers to inform clients and fans of upcoming events & availability.

Fully created within your `<div>` wrapper using JavaScript.

###Dependencies
* jQuery

###Setup
* Calendar requires a `<div>` element to act as a wrapper
* Initialize the calendar on page load and pass wrapper `<div>` as the container, a url to fetch your event JSON from, and a list of event types:
    
```
arc_calendar.init({
  container: $('#calendar')[0],
  url: document.getElementById('calendar').getAttribute('data-url'),
  event_types: ['Public', 'Private', 'Unavailable', 'Available'] 
})
```

###JSON API
* ArcCalendar expects event data JSON in the following format:

```
[
  {
    "summary" : "Event 1 summary",
    "accessible" : 0,
    "location" : "123 Abc Street",
    "date" : "11-11-2020"
  },
  {
    "summary" : "Event 2 summary",
    "accessible" : 1,
    "location" : "123 Xyz Drive",
    "date" : "01-11-2020"
  }
]
```

Currently, there are four accessibility options:
```
0: "Public"
1: "Private"
2: "Unavailable"
3: "Available" 
```