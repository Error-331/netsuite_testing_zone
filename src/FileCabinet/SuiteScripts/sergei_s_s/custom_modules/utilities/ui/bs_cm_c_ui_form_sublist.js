/**
 * @NApiVersion 2.1
 */
define([
    './../../libs/vendor/moment',
    './../bs_cm_general_utils'
    ],
    
    (
        moment,
        { isNullOrEmpty },
    ) => {
        function formatSublistDateField(columnId, cssVariableName, dateFormat = 'D-MMM-YYYY') {
            if (isNullOrEmpty(columnId)) {
                throw new Error('Column id is undefined or null, cannot set formatted date');
            }

            if (isNullOrEmpty(cssVariableName)) {
                throw new Error('CSS variable name is undefined or null, cannot set formatted date');
            }

            document.querySelectorAll(`tr td.uir-list-row-cell:nth-child(${columnId})`).forEach($child => {
                if (!isNullOrEmpty($child.innerHTML) && $child.innerHTML !== '&nbsp;') {
                    const formattedDate = moment($child.innerHTML).format(dateFormat);
                    $child.style.setProperty(`--${cssVariableName}`,`"${formattedDate}"`);
                } else {
                    $child.style.setProperty(`--${cssVariableName}`,' ');
                }
            });
        }

        function sortDescendSublistColumn(columnId) {
            if (isNullOrEmpty(columnId)) {
                throw new Error('Column id is undefined or null, cannot switch sorting')
            }

            const $column = document.querySelector(`tr td.listheadertd:nth-child(${columnId})`);

            $column?.click();
            $column?.click();
        }

        function sortAscendSublistColumn(columnId) {
            if (isNullOrEmpty(columnId)) {
                throw new Error('Column id is undefined or null, cannot switch sorting')
            }

            const $column = document.querySelector(`tr td.listheadertd:nth-child(${columnId})`);

            $column?.click();
        }

        function prepareStickyPagination(options = {}) {
            let {
                paginationContainerSelector = 'div.paginationContainer',
            } = options;

            const $netSuiteHeader = document.getElementById('div__header');
            const $paginationContainer = document.querySelector(paginationContainerSelector);

            if (isNullOrEmpty($netSuiteHeader) || isNullOrEmpty($paginationContainer)) {
                return;
            }

            const netSuiteHeaderClientRect = $netSuiteHeader.getBoundingClientRect();
            const paginationContainerOffsetTop  = $paginationContainer.offsetTop;

            function onWindowScroll() {
                if (window.scrollY >= (paginationContainerOffsetTop - netSuiteHeaderClientRect.height)) {
                    $netSuiteHeader.classList.remove('ns-shadow')
                    $paginationContainer.classList.add('paginationContainerSticky');

                    $paginationContainer.style.top = `${netSuiteHeaderClientRect.bottom}px`;
                } else {
                    $paginationContainer.classList.remove('paginationContainerSticky');
                    $paginationContainer.style.top = `inherit`;
                }
            }

            window.addEventListener('scroll', onWindowScroll);
            onWindowScroll();
        }

        return {
            formatSublistDateField,
            sortDescendSublistColumn,
            sortAscendSublistColumn,
            prepareStickyPagination,
        }
    });
