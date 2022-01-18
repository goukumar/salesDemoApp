(function () {
    // Range Slider
    var range = {

        selectors: {},
        /**
         * 
         * @param {*} rangeInput -> input element type=range
         * @param {*} numberInput -> input element type=number, output of range slider
         * @param {option: 0} -> Default value
         * @param {optional : 0} min -> minimum range value 
         * @param {optional : 100} max -> maximum range value
         */
        init: function (rangeInput, numberInput, cNameInput, value, min, max) {
            if (!rangeInput || !rangeInput) {
                throw ('require params are missing');
            }
            this.selectors.rangeInput = document.querySelector(rangeInput);
            this.selectors.numberInput = document.querySelector(numberInput);
            this.selectors.companyNameInput = document.querySelector(cNameInput);
            this.bindActions();

            if (min && typeof min === 'number') {
                this.selectors.rangeInput.setAttribute('min', min);
                this.selectors.numberInput.setAttribute('min', min);
            } else if (min && typeof min !== 'number') { throw ('minimum range must be numeric'); }

            if (max && typeof max === 'number') {
                this.selectors.rangeInput.setAttribute('max', max);
                this.selectors.numberInput.setAttribute('max', max);
            } else if (max && typeof max !== 'number') { throw ('maximum range must be numeric'); }

            if (value && typeof value === 'number') {
                this.selectors.numberInput.setAttribute('value', value);
                var event = new Event("change");
                this.selectors.numberInput.dispatchEvent(event);
            } else if (value && typeof value !== 'number'){ throw ('value must be numeric'); } 
            
            return this;
        },

        /**
         * Actions
         */
        bindActions: function () {
            var selectors = this.selectors;
            selectors.rangeInput.addEventListener('input', this.handleChange.bind(this));
            selectors.numberInput.addEventListener('change', this.handleChange.bind(this));
        },

        /**
         * Handler on change
         * @param {event} e 
         */
        handleChange: function (e) {
            var target = e.target;
            var selectors = this.selectors;
            var rangeInput = selectors.rangeInput;
            var numberInput = selectors.numberInput;

            if (e.target.type !== 'range') {
                target = rangeInput;
                rangeInput.value = numberInput.value; // range slider
            }
            var min = target.min;
            var max = target.max;
            var val = target.value;

            numberInput.value = val; // output range
            // target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
            target.style.backgroundSize = (val / max) * 100 + '% 100%'
        },

        /**
         * void(0)
         */
        reset: function (defaultRangeValue, min, max) {
            this.selectors.numberInput.setAttribute('min', min);
            this.selectors.numberInput.setAttribute('max', max)
            this.selectors.numberInput.value = defaultRangeValue;
            this.selectors.companyNameInput.value = "";
            var event = new Event("change");
            this.selectors.numberInput.dispatchEvent(event);
        }
    }

    // pagination 
    var pagination = function (settings) {
        if (!settings.records) throw ('total records @param missing');
        
        this.selectors = {
            prevArrow: '.pagination .prev-arrow',
            nextArrow: '.pagination .next-arrow',
            paginationList: '.pagination ul',
            pageLink: '.pagination li'
        }

        this.records = settings.records;
        this.perPage = settings.perPageRecord || 20;
        this.totalRecord = settings.records.length;
        this.currentPage = settings.defaultPage || 1; // default page on first load
        this.onPageChangeCallback = settings.onChangeCallback;
        this.totalPages = this.numPages();

        this.bindActions();
        this.template();
        this.changePage();
    }

    /**
     * Actions
     */
    pagination.prototype.bindActions = function () {
        var self = this;
        document.querySelector(this.selectors.prevArrow).addEventListener('click', this.prevPage.bind(this));
        document.querySelector(this.selectors.nextArrow).addEventListener('click', this.nextPage.bind(this));
        
        // Listener for clicks on pagination.
        document.querySelector(this.selectors.paginationList).addEventListener('click', this.goToPage.bind(this));
    }

    /**
     * 
     * @param {*} records -> accept an array object 
     */
    pagination.prototype.reGenerate = function (records) {
        this.records = records;
        this.totalRecord = records.length;
        this.currentPage = 1;
        this.totalPages = this.numPages();
        this.template();
        this.changePage();
    }

    /**
     * 
     * @returns number of pages calculate based on records
     */
    pagination.prototype.numPages = function () {
        return Math.ceil(this.totalRecord / this.perPage);
    }

    /**
     * void(0) -> handle the previous arrow click
     */
    pagination.prototype.prevPage = function () {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.changePage();
        }
    }
    
    /**
     * void(0) -> handle the next arrow click
     */
    pagination.prototype.nextPage = function () {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.changePage();
        }
    }

    /**
     * 
     * @param {*} e -> event object and handle direct page access
     */
    pagination.prototype.goToPage = function (e) {
        if (e.target && e.target.nodeName == 'BUTTON') {
            this.currentPage = e.target.parentElement.dataset.page;
            this.changePage();
        }
    }
    
    /**
     * void() -> pagination change handler method
     * calc the records as per page
     */
    pagination.prototype.changePage = function () {
        if (this.currentPage <= 1) {
            this.currentPage = 1;
        }

        if (this.currentPage >= this.totalPages) {
            this.currentPage = this.totalPages;
        }
        var results = new Array();

        for (var i = (this.currentPage - 1) * this.perPage; i < (this.currentPage * this.perPage); i++) {
            (this.records[i]) ? results.push(this.records[i]) : null;
        }

        this.activePage();
        this.onPageChangeCallback(results);
    }

    /**
     * void() -> handle the activation of pagination links
     */
    pagination.prototype.activePage = function () {
        if (document.querySelector(this.selectors.pageLink + '.active') !== null) {
            document.querySelector(this.selectors.pageLink + '.active').classList.remove('active');
        }
      
        document.querySelector(this.selectors.pageLink + "[data-page='" + this.currentPage + "']").classList.add('active')

        if (this.currentPage > 1) { 
            document.querySelector(this.selectors.prevArrow).classList.remove("disabled");
        } else {
            document.querySelector(this.selectors.prevArrow).classList.add("disabled");
        }

        if (this.currentPage < this.totalPages) { 
            document.querySelector(this.selectors.nextArrow).classList.remove("disabled");
        } else {
            document.querySelector(this.selectors.nextArrow).classList.add("disabled");
        }
    }

    /**
     * void()-> Create the pagination links
     */
    pagination.prototype.template = function () {
        var pagination = '';
        for (var i = 1; i <= this.totalPages; i++) {
            pagination += "<li data-page="+i+"><button aria-label='go to page"+ i +"'>" + i + "</button></li>";
        }
        document.querySelector(this.selectors.paginationList).innerHTML = pagination;
    }
    
    // create class sales
    var sales = sales || function (url, options) {
        if (!url) throw ('Required param missing');

        var self = this;
        
        this.selectors = {
            element: '.sales-results',
            totalSales: '.total-sale',
            pageSubTotal: '.page-subtotal',
            numberOfClients: '.clients',
            averageSale: '.average-sale',
            filters: '.filters',
            refresh: '.refresh',
            range: '.range input[type="range"]',
            rangeOutput: '.range input[type="number"]',
            cNameInput: '.c-name input[type="text"]'
        }

        this.api = url;
        this.perPageRecords = options['perPageRecords'] || 10;
        this.defaultPage = options['defaultPage'] || 1;
        this.minRange = options['minRange'] || 0;
        this.maxRange = options['maxRange'] || 800;
        this.defaultRangeValue = options['defaultRangeValue'] || 100;

        this.fetch(this.api, function (response) {
            self.salesData = response; // Cache total sales results
            self.salesCalc();
        
            var paginationSettings = {
                records: self.salesData,
                perPageRecord: self.perPageRecords,
                defaultPage: self.defaultPage,
                onChangeCallback: self.display.bind(self)
            }
            self.pagination = new pagination(paginationSettings);
        });
        this.range = range.init(this.selectors.range, this.selectors.rangeOutput, this.selectors.cNameInput, this.defaultRangeValue, this.minRange, this.maxRange);
        this.bindActions();
    }; 

    /**
     * void() -> Actions binding 
     */
    sales.prototype.bindActions = function () {
        document.querySelector('.filters').addEventListener('submit', this.filterHandler.bind(this));
        document.querySelector(this.selectors.refresh).addEventListener('click', this.refresh.bind(this));
    }

    /**
     * 
     * @param {*} url -> Required the API URL to make the rest call
     * @param {*} callback -> execute on success
     */
    sales.prototype.fetch = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = processResponse;
        xhr.open("GET", url);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();

        this.spinner();
        
        function processResponse() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(JSON.parse(xhr.responseText));
                } else {
                    console.log('Error: ' + xhr.status);
                }
            }
        }
    }

    /**
     * 
     * @param {*} results -> accepts array of objects and create the row in table
     */
    sales.prototype.display = function (results) {
        var row = '';
        var pageSubTotal = 0;
        for (var i = 0; i < results.length; i++) {
            var cell = "<td>" + results[i].name;
            if (results[i].flag) {
                cell += "<span class='flag-icon'></span>";
            }
            cell += "</td>";
            cell += "<td>" + results[i].company + "</td>";
            cell += "<td>" + results[i].sales + "</td>";
            
            row += "<tr>" + cell + "</tr>";

            pageSubTotal += results[i].sales;
        }
        document.querySelector(this.selectors.element).innerHTML = row;
        
        // page sales subtotal
        document.querySelector(this.selectors.pageSubTotal).textContent = Number.parseFloat(pageSubTotal).toFixed(2);

    }
    
    /**
     * calculate sales data, Total sales, clients sale > 800 and top performer average sale
     */
    sales.prototype.salesCalc = function () {
        self = this;
        var total = 0;
        var topPerformerClients = 0;
        var topPerformerSale = 0;
        for (var i = 0; i < this.salesData.length; i++) { 
            total += self.salesData[i].sales;
            if (self.salesData[i].sales > 800) {
                self.salesData[i].flag = true;
                topPerformerSale += self.salesData[i].sales;
                topPerformerClients++;
            }
        }
        
        // total sales
        document.querySelector(this.selectors.totalSales).textContent = Number.parseFloat(total).toFixed(2);

        // clients
        document.querySelector(this.selectors.numberOfClients).textContent = topPerformerClients;

        // average monthly sale
        document.querySelector(this.selectors.averageSale).textContent = Math.round(topPerformerSale / topPerformerClients);
    }
    
    /**
     * 
     * @param {*} e -> event object pointing to form 
     * Handle the filtration of data
     */
    sales.prototype.filterHandler = function (e) {
        e.preventDefault();
        var self = this;
        var filterByCompany = e.target.elements.cname.value || null;
        var filterByMinSales = e.target.elements.minrange.value || 0;

        var filteredData = filter(filterByCompany, filterByMinSales);
        this.pagination.reGenerate(filteredData);

        function filter(byCompany, byRange) {
            var results = new Array();
            for (var i = 0; i < self.salesData.length; i++) {
                if (byCompany) {
                    if (self.salesData[i].company.indexOf(byCompany) && self.salesData[i].sales > byRange) {
                        results.push(self.salesData[i]);
                    }
                } else {
                    if (self.salesData[i].sales >= byRange) { results.push(self.salesData[i]); };
                }
            }
            return results;
        }
    }
    /**
     * fetch the fresh data from end point and refresh on page
     */
    sales.prototype.refresh = function (e) {
        e.preventDefault();

        var self = this;
        this.fetch(this.api, function (response) {
            self.salesData = response; // Cache total sales results
            self.salesCalc();

            var paginationSettings = {
                records: self.salesData,
                perPageRecord: self.perPageRecords,
                defaultPage: self.defaultPage,
                onChangeCallback: self.display.bind(self)
            }
            self.pagination = new pagination(paginationSettings);
            self.range.reset(self.defaultRangeValue, self.minRange, self.maxRange);
        });
    },

    /**
     * 
     * @param {*} spinner -> accept on | off loader
     */
    sales.prototype.spinner = function (spinner) {
      
        if (spinner === 'off') {
            document.querySelector(this.selectors.element).remove();
        } else {
            var spinner = "<tr class='spinner-container'><td colspan='3'><div class='spinner'></div></td></tr>";
            document.querySelector(this.selectors.element).innerHTML = spinner;
        }
    }

    salesObject = new sales('/data/mock_data.json', {
        perPageRecords: 20,
        minRange: 0,
        maxRange: 1000,
        defaultRangeValue: 200
    });
    
})();
