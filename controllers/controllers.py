# from odoo import http


# class FlowTrade(http.Controller):
#     @http.route('/trade_flow/trade_flow', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/trade_flow/trade_flow/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('trade_flow.listing', {
#             'root': '/trade_flow/trade_flow',
#             'objects': http.request.env['trade_flow.trade_flow'].search([]),
#         })

#     @http.route('/trade_flow/trade_flow/objects/<model("trade_flow.trade_flow"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('trade_flow.object', {
#             'object': obj
#         })

