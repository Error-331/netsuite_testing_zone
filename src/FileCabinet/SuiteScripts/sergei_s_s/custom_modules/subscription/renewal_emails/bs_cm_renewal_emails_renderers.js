/**
 * @NApiVersion 2.1
 */
define(['N/render'],
    /**
 * @param{render} render
 */
    (render) => {
        function renderTransactionTPDF(entityId) {
            return render.transaction({
                entityId,
                printMode: render.PrintMode.PDF
            });
        }

        return {
            renderTransactionTPDF,
        }
    });
