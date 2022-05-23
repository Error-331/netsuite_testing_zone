/**
 * @NApiVersion 2.1
 */
define(['N/ui/dialog'],
    /**
 * @param{dialog} dialog
 */
    (dialog) => {
        function showLoadingDialog(onShowCb = () => {}) {
            const $body = document.querySelector('body');
            const observerConfig = { attributes: false, childList: true, subtree: false };

            const observer = new MutationObserver((mutationList, observer) => {
                for(const mutation of mutationList) {
                    if (mutation.type === 'childList') {

                        if (mutation.addedNodes.length > 0) {
                            for (const $node of mutation.addedNodes) {
                                if ($node.classList.contains('x-window')) {
                                    observer.disconnect();
                                    onShowCb();
                                }
                            }
                        }
                    }
                }
            });

            observer.observe($body, observerConfig);

            const options = {
                title: 'Notice',
                message: '<b style="font-size: 14px;">Data is loading. Please wait...</b>',
                buttons: [
                    { label: 'cancel', value: 1 },
                ],
            };

            dialog.create(options);
            document.querySelector('.uir-message-buttons').style.display = 'none';

            const $dialogButtons = document.querySelector('.x-window button');
            $dialogButtons.style.display = 'none';

            return () => { $dialogButtons.click(); };
        }

        return { showLoadingDialog }

    });
