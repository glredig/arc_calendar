#arc_calendar
ArcCalendar is a dynamically generated calendar that populates events via an AJAX call to your JSON API.

Fully created within your `<div>` wrapper using JavaScript.


###Technology Stack
* JavaScript

###Dependencies
* jQuery

###Setup
* Calendar requires a `<div>` element to act as a wrapper
* Initialize the calendar on page load and pass wrapper `<div>` as the container:
    ```
    arc_calendar.init({
      container: $('#calendar')[0]
    })```
