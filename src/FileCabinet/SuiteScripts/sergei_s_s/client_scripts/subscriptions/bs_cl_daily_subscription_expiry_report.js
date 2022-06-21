/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/ui/dialog',
    'N/ui/message',
     './../../custom_modules/aggregations/custom/bs_cm_disposition_action_list',
    './../../custom_modules/aggregations/custom/bs_cm_exp_network_disposition',
    './../../custom_modules/utilities/ui/bs_cm_c_ui_dialogbox',
    './../../custom_modules/utilities/specific/bs_cm_daily_subscription_expiry_report_utils',
    './../../custom_modules/utilities/bs_cm_general_utils',
],
/**
 * @param{dialog} dialog
 * @param{message} message
 * @param{serverWidget} serverWidget
 */
function(
    dialog,
    message,
    { loadDispositionActionForSelect },
    { loadExpiredNetworksWithDispositionDataByNetwork },
    { showLoadingDialog },
    { prepareNoteHeader, formatDateForReport },
    { isNullOrEmpty, toInt },
) {
    // state variables
    let $actionButtons;
    let $notesSections;
    let $moreLinks;

    let expiredNetworks;
    let dispositionActions;

    // DOM action handlers
    function onActionButtonClick(event) {
        event.stopPropagation();

        const networkId = toInt(getComputedStyle(event.currentTarget).getPropertyValue('--network'));
        showEditDialog(networkId, expiredNetworks[networkId].custrecordnote, expiredNetworks[networkId].custrecordaction);
    }

    function onMoreLinkClick(event) {
        event.preventDefault();

        const $parent = event.target.parentElement;
        let networkId = $parent.dataset.networkid

        if (isNullOrEmpty(networkId)) {
            return;
        }

        networkId = toInt(networkId);
        const networkData = expiredNetworks[networkId];

        if (isNullOrEmpty(networkData) || isNullOrEmpty(networkData['custrecordnote'])){
            return
        }

        if (event.target.dataset.more === 'T') {
            event.target.previousSibling.innerHTML = networkData['custrecordnote'];
            event.target.innerHTML = '(less...)';

            event.target.dataset.more = 'F';
        } else {
            event.target.previousSibling.innerHTML = `${networkData['custrecordnote'].substring(0, 200)}...`;
            event.target.innerHTML = '(more...)';

            event.target.dataset.more = 'T';
        }
    }

    function onDispositionFormSubmitClick() {
        document.getElementById('custpage_dispositionform').submit();
    }

    // business logic
    function loadData() {
        expiredNetworks = loadExpiredNetworksWithDispositionDataByNetwork();
        dispositionActions = loadDispositionActionForSelect();
    }

    function addCSNotes() {
        $notesSections.forEach($noteSection => {
            let networkId = $noteSection.dataset.networkid;

            if (!isNullOrEmpty(networkId)) {
                networkId = toInt(networkId);
                const networkData = expiredNetworks[networkId];

                if (!isNullOrEmpty(networkData) && !isNullOrEmpty(networkData['custrecordnote'])){
                    const noteHeader = `<span>${prepareNoteHeader(networkData['custrecorddate_modified'], networkData['actionname'], networkData['employeename'])} | </span>`;
                    const notes = networkData['custrecordnote'];

                    const linksMore = `<a href="#" data-type="morelink" class="moreLink" data-more="T">(more...)</a>`
                    const linkToNotes = `<a target="_blank" class="noteslink" href="/app/common/custom/custrecordentry.nl?rectype=575&id=${networkData['custrecord_id']}">Notes -></a>`; // 569

                    $noteSection.innerHTML = (notes.length) > 200 ? `${noteHeader}<span>${notes.substring(0, 200)}...</span>${linksMore}${linkToNotes}` : `${noteHeader}${notes}${linkToNotes}`;
                } else {
                    $noteSection.innerHTML = ' ';
                }
            }
        });
    }

    function bindActions() {
        $actionButtons.forEach($actionButton => {
            $actionButton.addEventListener('click', onActionButtonClick);
        });

        $moreLinks.forEach($moreLink => {
            $moreLink.addEventListener('click', onMoreLinkClick);
        });
    }

    function showEditDialog(networkId, note, selectedActionId) {
        const optionsStr = dispositionActions.reduce((options, { id, name }) => {
            options += `<option value="${id}" ${(!isNullOrEmpty(selectedActionId) && toInt(selectedActionId) === id) ? 'selected' : ''}>${name}</option>`;
            return options;
        }, '');

        const formHTML = `
            <form id="custpage_dispositionform" method="post" style="display: flex; flex-direction: column; flex-wrap: nowrap; justify-content: flex-start; align-items: stretch; align-content: flex-start;">
                <div style="flex-basis: auto; flex-grow: 0; flex-shrink: 0; display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: center; align-content: flex-start;">
                    <label style="flex-basis: auto; flex-grow: 0; flex-shrink: 0; margin-right: 10px" for="cars">Action:</label>
                    <select style="flex-basis: auto; flex-grow: 1; flex-shrink: 0;" id="cars" name="custpage_action">
                        ${ optionsStr }
                    </select>
                </div>
                <textarea name="custpage_note" rows="5" cols="30" style="flex-basis: auto; flex-grow: 0; flex-shrink: 0; resize: none; margin-top: 10px;" maxlength="200">${isNullOrEmpty(note) ? '' : note}</textarea>
                <div style="flex-basis: auto; flex-grow: 0; flex-shrink: 0; margin-top: 5px; font-size: 10px">The maximum allowed field length is 200 characters</div>
                <input type="hidden" name="custpage_networkid" value="${networkId}">
            </form>
        `;

        const options = {
            title: 'Update disposition',
            message: formHTML,
            buttons: [
                { label: 'update', value: 1 },
                { label: 'cancel', value: 2 },
            ],
        };

        dialog.create(options);

        const $dialogButtons = document.querySelectorAll('.x-window button');
        $dialogButtons[0].classList.add('pgBntB');

        const $submitButton = $dialogButtons[0].cloneNode(true);
        $dialogButtons[0].replaceWith($submitButton);

        $submitButton.addEventListener('click', onDispositionFormSubmitClick);
    }

    // page action handlers
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        const hideLoadingDialog = showLoadingDialog(() => {
            $actionButtons = document.querySelectorAll('tr td.uir-list-row-cell:nth-child(8)');
            $notesSections = document.querySelectorAll('section[data-sectiontype="cs_team_notes"]');

            loadData();
            addCSNotes();

            $moreLinks = document.querySelectorAll('a[data-type="morelink"]');

            document.querySelectorAll('tr td.uir-list-row-cell:nth-child(3) section[data-sectiontype="subcription_records"]').forEach($child => {
                let links = ''
                for (const { subscription_subscriptionid } of expiredNetworks[$child.dataset.networkid].groupedData.subscription) {
                    links += `<a target="_blank" href="/app/accounting/subscription/subscription.nl?id=${subscription_subscriptionid}">${subscription_subscriptionid}</a><br/>`
                }

                $child.innerHTML = links;
            });

            document.querySelectorAll('tr td.uir-list-row-cell:nth-child(6)').forEach($child => {
                $child.style.setProperty('--expdate',`"${formatDateForReport($child.innerHTML)}"`);
            });

            document.querySelectorAll('tr td.uir-list-row-cell:nth-child(7)').forEach($child => {
                if (!isNullOrEmpty($child.innerHTML) && $child.innerHTML !== '&nbsp;') {
                    $child.style.setProperty('--expdate',`"${formatDateForReport($child.innerHTML)}"`);
                }
            });

            $actionButtons.forEach($child => {
                const compStyles = getComputedStyle($child)

                $child.style.setProperty('--label', compStyles.getPropertyValue('--label'));
                $child.style.setProperty('--bgImage', compStyles.getPropertyValue('--bgImage'));
                $child.style.setProperty('--textColor', compStyles.getPropertyValue('--textColor'));
                $child.style.setProperty('--action',compStyles.getPropertyValue('--action'));
                $child.style.setProperty('--network', compStyles.getPropertyValue('--network'));
            });

            bindActions();
            hideLoadingDialog();
        });
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord,
    };
    
});
