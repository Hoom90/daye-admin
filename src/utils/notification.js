
// import toastr from "toastr"
// import "toastr/build/toastr.min.css"

// toastr.options = {
//     "closeButton": true,
//     "debug": true,
//     "newestOnTop": true,
//     "progressBar": true,
//     "positionClass": "toast-top-center",
//     "preventDuplicates": false,
//     "onclick": null,
//     "showDuration": "300",
//     "hideDuration": "1000",
//     "timeOut": "5000",
//     "extendedTimeOut": "1000",
//     "showEasing": "swing",
//     "hideEasing": "linear",
//     "showMethod": "fadeIn",
//     "hideMethod": "fadeOut"
// }


import { toast } from 'vue3-toastify';
export default {
    success(message) {
       toast.success(message)
    },
    error(message) {
       toast.error(message)
    },
    info(message) {
      toast.info(message);
    },
    warning(message) {
       toast.warn(message)
    },
    loading(message) {
       toast.loading(message)
    },
    apiError(e) {
        let Error = ''
        if (Array.isArray(e))
            e.forEach(err => {
                Error += err + '<br/>'
            })
        else
            Error = e
        toast(Error, {
            type: "error"
        })
    },

}