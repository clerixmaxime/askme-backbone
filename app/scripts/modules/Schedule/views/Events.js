define([
    'underscore',
    'backbone',
    'templates',
    'modules/Schedule/views/EventDetails',
    'modules/Schedule/models/Event',
    'lib/breakpoints',
    'fullcalendar'
], function(_, Backbone, JST, EventDetails, EventModel, Breakpoint) {
    'use strict';

    var _isTabletViewport = function(width) {
        return width <= Breakpoint.iPad.portrait;
    };

    return Backbone.View.extend({

        initialize: function() {
            var that = this;
            this.collection.fetch({
                reset: true,
                success: function(model,  collection, response, options) {
                    that.$el.fullCalendar('addEventSource', model.toJSON());
                },
                error : function(model, response, options) {
                    console.log('Error loading events from server');
                }
            });
            this.eventDetails = new EventDetails();
        },

        adjustOnResize: function(dimensions) {
        },

        render: function() {

            var that = this;
            var today = new Date(),
                wsFirst = new Date(2013, 6, 22),
                minDate = (wsFirst > today) ? wsFirst : today,
                eventTemplate = JST['app/templates/event.hbs'],
                timeFormat = 'h:mm';
            this.$el.fullCalendar({
                date: minDate.getDate(),
                month: minDate.getMonth(),
                year: minDate.getFullYear(),
                header: {
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                },
                defaultView: 'agendaDay',
                selectable: false,
                selectHelper: false,
                editable: false,
                ignoreTimezone: false,
                titleFormat: {
                    day: 'MMM d, yyyy'                  // Tuesday, Sep 8, 2009
                },
                minTime: 8,
                maxTime: 22,
                height: 9999,
                allDaySlot: false,
                eventClick: function(event) {
                    that.collection.fetch({
                        success: function(model) {
                            that.eventDetails.event = $.extend({}, event);
                            that.eventDetails.event.votes = model.get(event.id).get('votes');
                            that.eventDetails.event.value = model.get(event.id).get('value');
                            that.eventDetails.event.average = model.get(event.id).get('average');
                            that.eventDetails.render();
                        }
                    });
                },
                eventAfterRender: function(event, element) {
                    var attrs = {
                        subject: event.subject,
                        start: $.fullCalendar.formatDate(event.start, timeFormat),
                        end: $.fullCalendar.formatDate(event.end, timeFormat),
                        location: event.location,
                        presenters: event.presenters,
                    };
                    element.find('.fc-event-inner').html(
                        eventTemplate({ model: attrs })
                    );
                }

           });

           return this;
        },

        eventDropOrResize: function(event, allDay, revertFunc) {
            return false;
        }
    });
});