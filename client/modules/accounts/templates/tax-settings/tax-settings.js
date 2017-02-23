import _ from "lodash";
import { Accounts } from "/lib/collections";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { TaxEntityCodes } from "/client/collections";

Template.taxSettingsPanel.helpers({
  account() {
    if (Reaction.Subscriptions.Account.ready()) {
      return Accounts.findOne({
        userId: Meteor.userId()
      });
    }
    return null;
  },
  entityCodes() {
    return _.concat(TaxEntityCodes.find().map((entityCode) => {
      return _.assign({}, entityCode, {
        label: entityCode.name,
        value: entityCode.code
      });
    }), [
      {
        label: "SET CUSTOM VALUE",
        value: "CUSTOM USER INPUT"
      }
    ]);
  }
});

Template.taxSettingsPanel.events({
  "change [data-event-action=decide]": function (event) {
    event.stopPropagation();
    const formData = AutoForm.getFormValues("tax-settings-form");
    const value = _.get(formData, "insertDoc.taxSettings.customerUsageType");
    if (value === "CUSTOM USER INPUT") {
      $(".customerUsageType").toggleClass("hide");
    }
  }
});

Template.taxSettingsPanel.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Account");
  });

  Meteor.call("avalara/getEntityCodes", (error, entityCodes) => {
    _.each(entityCodes, (entityCode) => {
      TaxEntityCodes.insert(entityCode);
    });
  });
});

AutoForm.hooks({
  "tax-settings-form": {
    before: {
      update: function (doc) {
        const value = $(".customerUsageType input").val();
        doc.$set["taxSettings.customerUsageType"] = value;
        return doc;
      }
    }
  }
});
