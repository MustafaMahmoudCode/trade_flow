/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const { Component, useState, onWillStart, useRef } = owl;

// ==================================================
// Owl Shipment List Component
// ==================================================
export class OwlShipmentList extends Component {
    // Props (Action binding)
    static props = {
        action: Object,
        actionId: Number,
        updateActionState: Function,
        className: String,
    };

    // ----------------------------------------------
    // Setup
    // ----------------------------------------------
    setup() {
        this.orm = useService("orm");
        this.searchInputRef = useRef("search-input");

        // State
        this.state = useState({
            shipmentForm: this._getEmptyShipment(),
            shipments: [],
            clients: [],
            employees: [],
            isEdit: false,
            activeId: false,
        });

        // Lifecycle
        onWillStart(async () => {
            await this._loadInitialData();
        });
    }

    // ==================================================
    // Initial Data
    // ==================================================
    async _loadInitialData() {
        await Promise.all([          // 3 works at the moment
            this._fetchClients(),
            this._fetchEmployees(),
            this._fetchShipments(),
        ]);
    }

    // ==================================================
    // Fetch Methods = get all tasks
    // ==================================================
    async _fetchShipments(domain = []) {
        const records = await this.orm.searchRead(
            "shipping.shipment",
            domain,
            ["name", "weight", "shipment_type", "state", "client_id", "employee_id"]
        );

        this.state.shipments = records.map(this._formatShipment);
    }

    async _fetchClients() {
        this.state.clients = await this.orm.searchRead(
            "shipping.client",
            [],
            ["name"]
        );
    }

    async _fetchEmployees() {
        this.state.employees = await this.orm.searchRead(
            "shipping.employee",
            [],
            ["name"]
        );
    }

    // ==================================================
    // Helpers / Formatting
    // ==================================================
    _formatShipment(shipment) { // Name is redy for view
        return {
            ...shipment,
            client_name: shipment.client_id ? shipment.client_id[1] : "",
            employee_name: shipment.employee_id ? shipment.employee_id[1] : "",
        };
    }

    _getEmptyShipment(name = "") { // Data >> UI
        return {
            name,
            weight: 0,
            shipment_type: "standard",
            state: "pending",
            client_id: false,
            employee_id: false,
        };
    }
    _generateShipmentName() { //name (SHIP-010)
        if (!this.state.shipments.length) return "SHIP-001";

        const lastName = this.state.shipments.at(-1).name;
        const match = lastName?.match(/(\d+)$/);

        const nextId = match ? parseInt(match[1], 10) + 1 : 1;
        return `SHIP-${nextId.toString().padStart(3, "0")}`;
    }

    // ==================================================
    // CRUD Actions
    // ==================================================
    addShipment() {
        this.state.shipmentForm = this._getEmptyShipment(
            this._generateShipmentName()
        );
        this.state.isEdit = false;
        this.state.activeId = false;
    }

    editShipment(shipment) {
        this.state.shipmentForm = {
            name: shipment.name,
            weight: shipment.weight,
            shipment_type: shipment.shipment_type,
            state: shipment.state,
            client_id: shipment.client_id ? shipment.client_id[0] : false,
            employee_id: shipment.employee_id ? shipment.employee_id[0] : false,
        };

        this.state.isEdit = true;
        this.state.activeId = shipment.id;
    }

    async saveShipment() {
        const s = this.state.shipmentForm;

        if (!s.client_id) {
            return alert("Please select a Client!");
        }

        const data = {
            name: s.name,
            weight: s.weight,
            shipment_type: s.shipment_type,
            state: s.state,
            client_id: Number(s.client_id),
            employee_id: s.employee_id ? Number(s.employee_id) : false,
        };

        if (this.state.isEdit && this.state.activeId) {
            await this.orm.write("shipping.shipment", [this.state.activeId], data);
        } else {
            await this.orm.create("shipping.shipment", [data]);
        }

        await this._fetchShipments();
        this.addShipment();
    }

    async deleteShipment(shipment) {
        if (!shipment?.id) return;

        await this.orm.unlink("shipping.shipment", [shipment.id]);
        await this._fetchShipments();
        this.addShipment();
    }

    // ==================================================
    // Search
    // ==================================================
    async searchShipment() {
        const value = this.searchInputRef.el?.value || "";

        await this._fetchShipments([
            ["name", "ilike", value],
        ]);
    }
}

// ==================================================
// Template & Action Registry
// ==================================================
OwlShipmentList.template = "trade_flow.ShipmentList";
registry
    .category("actions")
    .add("shipment_list.action_js", OwlShipmentList);
