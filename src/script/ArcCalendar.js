var arc_calendar = (function() {
  var today = new Date(),
      current_date = {
        month: today.getMonth()
      },
      MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      DAYS_OF_THE_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      container,
      blank_date_message;

  function Calendar(config) {
    this.container = config.container;
    this.menu = {};
    this.cal = {};
    this.cache = {};
    this.events_url = config.events_url + '.json';
  }

  Calendar.prototype = {
    init: function() {
      var today = new Date();

      this.todays = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day_of_the_month: today.getDate(),
        day_of_the_week: today.getDay()
      }

      this.getEvents(this._build);
    },

    _build: function() {
      var clear = document.createElement('div');

      clear.className = 'clear';

      this.container.className += 'arc_calendar_container';

      this.menu.container = document.createElement('div');
      this.menu.container.className = 'arc_calendar_menu';
      this.menu.prevMonth = document.createElement('div');
      this.menu.prevMonth.innerHTML = '<';
      this.menu.prevMonth.className = 'arc_calendar_prev_month';
      this.menu.currentMonth = document.createElement('div');
      this.menu.currentMonth.innerHTML = MONTHS[this.todays.month] + ' ' + this.todays.year;
      this.menu.currentMonth.className = 'arc_calendar_current_month';
      this.menu.nextMonth = document.createElement('div');
      this.menu.nextMonth.innerHTML = '>';
      this.menu.nextMonth.className = 'arc_calendar_next_month';

      this.menu.container.appendChild(this.menu.prevMonth);
      this.menu.container.appendChild(this.menu.currentMonth);
      this.menu.container.appendChild(this.menu.nextMonth);
      this.menu.container.appendChild(clear);

      this.container.appendChild(this.menu.container);

      this.cal.container = document.createElement('div');
      this.cal.container.className = 'arc_calendar_cal_container';

      this.container.appendChild(this.cal.container);

      this.cache[this.todays.year] = {};

      this.cache[this.todays.year][this.todays.month] = new Month({
        year: this.todays.year,
        parent: this,
        month: this.todays.month
      });

      this.cache[this.todays.year][this.todays.month].init();
      
      this.active_month = this.cache[this.todays.year][this.todays.month];

      /** Set up listeners */
      $(this.menu.prevMonth).on('click', $.proxy(function() {
        this.prevMonth();
      }, this));

      $(this.menu.nextMonth).on('click', $.proxy(function() {
        this.nextMonth();
      }, this));

    },   

    nextMonth: function() {
      var next_month = {};

      if (this.active_month.month == 11) {
        next_month.year = this.active_month.year + 1;
        next_month.month = 0;
      }
      else {
        next_month.year = this.active_month.year;
        next_month.month = this.active_month.month + 1;
      }

      this.checkCacheAndUpdate(next_month);
    },

    prevMonth: function() {
      var previous_month = {};

      if (this.active_month.month == 0) {
        previous_month.year = this.active_month.year - 1;
        previous_month.month = 11;
      }
      else {
        previous_month.year = this.active_month.year;
        previous_month.month = this.active_month.month - 1;
      }

      this.checkCacheAndUpdate(previous_month);
    },

    checkCacheAndUpdate: function(updated_month) {
      /** Year exists in cache */
      if (typeof this.cache[updated_month.year] == 'object') {
        /** Month exists in cache; load it */
        if (typeof this.cache[updated_month.year][updated_month.month] == 'object') {
          this.active_month.hide();
          this.active_month = this.cache[updated_month.year][updated_month.month];
          this.active_month.show();
        }
        /** Month does not exist in cache; build it */
        else {
          this.active_month.hide();
          this.cache[updated_month.year][updated_month.month] = new Month({
            year: updated_month.year,
            parent: this,
            month: updated_month.month
          });

          this.cache[updated_month.year][updated_month.month].init();
          this.active_month = this.cache[updated_month.year][updated_month.month];
        }
      }
      else {
        this.active_month.hide();
        this.cache[updated_month.year] = {};
        this.cache[updated_month.year][updated_month.month] = new Month({
          year: updated_month.year,
          parent: this,
          month: updated_month.month
        });

        this.cache[updated_month.year][updated_month.month].init();
        this.active_month = this.cache[updated_month.year][updated_month.month];
      }

      this.menu.currentMonth.innerHTML = MONTHS[this.active_month.month] + ' ' + this.active_month.year;
    },

    getEvents: function(callback) {
      var xhr = new XMLHttpRequest(),
          this_obj = this;

      xhr.open('get', this.events_url);

      xhr.addEventListener('load', function (e) {
        this_obj.data = JSON.parse(xhr.responseText);
        callback.apply(this_obj);
      }, false);

      xhr.send();
    },

    removeEvent: function(i) {
      this.data.splice(i, 1);
    }
  }

  function Month(config) {
    this.month = config.month;
    this.year = config.year;
    this.parent = config.parent;
    this.rows = [];
    this.days = [];
  }

  Month.prototype = {
    init: function() {
      this.number_of_days = DAYS_IN_MONTH[this.month];

      if (this._check_leap() && this.month == 1) {
        this.number_of_days = 29;
      }

      this.first_day = this.getFirstDay();
      console.log("rows needed: ", this.getRowsNeeded());
      this.rows_needed = this.getRowsNeeded();

      this._build();
    },

    _check_leap: function() {
      var is_leap = false;

      if (this.year % 400 == 0) {
        is_leap = true;
      }
      else if (this.year % 100 == 0) {
        is_leap = false;
      }
      else if (this.year % 4 == 0) {
        is_leap = true;
      }

      return is_leap;
    },

    getFirstDay: function() {
      var d = new Date(this.month + 1 + '-1-' + this.year);
      return d.getDay();
    },

    getRowsNeeded: function() {
      if (this.first_day == 0 && this.number_of_days < 29) {
        return 4
      }
      else if (this.first_day > 5 && this.number_of_days == 31) {
        return 6
      }
      else if (this.first_day > 6 && this.number_of_days == 30) {
        return 6
      }
      else {
        return 5
      }
    },

    _build: function() {
      var i, j, k,
          row,
          cell,
          cell_count = 0,
          cell_day = 1;

      this.table = document.createElement('table');
      this.table.className = 'arc_calendar_table';
      this.rows.push(this.table.insertRow());

      for (i = 0; i < 7; i++) {
        cell = this.rows[0].insertCell();
        cell.className = "arc_calendar_day_header";
        cell.innerHTML = DAYS_OF_THE_WEEK[i];
      }

      for (j = 0; j < this.rows_needed; j++) {
        row = this.table.insertRow();
        this.rows.push(row);

        for (k = 0; k < 7; k++) {
          day = new Day({
            parent: this
          });
          day.cell = row.insertCell();
          day.content_div = document.createElement('div');
          day.content_div.className = 'arc_calendar_td_div';
          day.cell.appendChild(day.content_div);
          day.setYear(this.year);

          if (cell_count < (this.first_day - 1) || cell_day > this.number_of_days) {
            day.is_in_month = false;
            day.setMonth(null);
            day.cell.className = 'arc_calendar_inactive_day';
          }
          else {
            day.setMonth(this.month);
            day.setYear(this.year);
            day.setDay(cell_day);
            day.content_div.innerHTML = cell_day;
            cell_day++;
          }

          day.init();
          cell_count++;
        }
      }

      this.parent.cal.container.appendChild(this.table);
    },

    hide: function() {
      this.table.style.display = 'none';
    },

    show: function() {
      this.table.style.display = 'table';
    }
  }

  function Day(config) {
    this.is_in_month = true;
    this.parent = config.parent;
    this.events = [];
  }

  Day.prototype = {
    init: function() {
      var i,
          event_type;

      for (i = 0; i < this.parent.parent.data.length; i++) {
        if (this.parent.parent.data[i].date == this.dateToString()) {
          this.events.push(this.parent.parent.data[i]);
          console.log(this.parent.parent.data[i]);
          event_type = (this.parent.parent.data[i] == undefined ? 'none' : this.parent.parent.data[i]["accessible"]);
          this.parent.parent.removeEvent(i);
          this.cell.className += " has_event type_" + event_type;
        }
      }

      this.popup = new Popup();
    },

    setDay: function(day) {
      this.day = day;
    },

    setMonth: function(month) {
      this.month = month;
    },

    setYear: function(year) {
      this.year = year;
    },

    dateToString: function() {
      if (this.month != null && this.month != undefined) {
        return ("0" + (this.month + 1)).slice(-2) + "-" + ("0" + this.day).slice(-2) + "-" + this.year;
      }
      else {
        return false;
      }
    }
  }

  function Popup() {

  }

  Popup.prototype = {
    init: function() {
      this._build();
    },

    _build: function() {

    },

    show: function() {

    },

    hide: function() {

    },

    toggle: function() {

    }
  }

  function getEvents() {

  } 

  return {
    init: function(config) {
      var cal;
      blank_date_message = config.default_message || 'No event';

      cal = new Calendar({
        container: config.container,
        events_url: config.url
      });

      cal.init();
    }
  }  
})();

