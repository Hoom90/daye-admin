
import { defineStore } from 'pinia'
  
export const dashboardbreadcrumbstore =
        defineStore('dashboardbreadcrumb', {
        state: () => ({
            breadcrumbs: [],
        }),
        getters: {
            getBreadCrumbs: (state) => {
                return [{
                    title: 'کنترل پنل',
                    disabled: false,
                    to: '/dashboard'
                },
                ...state.breadcrumbs]
            }
        },
        actions: {
            setBreadCrumbs(breadcrumbs) {
                this.breadcrumbs = breadcrumbs
            }
        }
    })
