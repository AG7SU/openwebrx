from owrx.form.input import Input
from owrx.form.input.validator import Validator
from owrx.form.error import ValidationError
from owrx.config import Config

import logging
import html

logger = logging.getLogger(__name__)


class LocationValidator(Validator):
    def validate(self, key, value):
        if "lat" in value and not -90 < value["lat"] < 90:
            raise ValidationError(key, "Latitude out of range (-90 to 90)")
        if "lon" in value and not -180 < value["lon"] < 180:
            raise ValidationError(key, "Longitude out of range (-180 to 180)")
        pass


class LocationInput(Input):
    def __init__(self, id, label, validator: Validator = None):
        if validator is None:
            validator = LocationValidator()
        super().__init__(id, label, validator=validator)

    def render_input_group(self, value, errors):
        return """
            <div class="row {rowclass}">
                {inputs}
            </div>
            {errors}
            <div class="row">
                <div class="col map-input" data-key="{key}" for="{id}"></div>
            </div>
        """.format(
            id=html.escape(str(self.id), quote=True),
            rowclass="is-invalid" if errors else "",
            inputs=self.render_input(value, errors),
            errors=self.render_errors(errors),
            key=html.escape(str(Config.get()["google_maps_api_key"]), quote=True),
        )

    def render_input(self, value, errors):
        return "".join(self.render_sub_input(value, id, errors) for id in ["lat", "lon"])

    def render_sub_input(self, value, id, errors):
        return """
            <div class="col">
                <input type="number" class="{classes}" id="{id}" name="{id}" placeholder="{label}" value="{value}"
                step="any" {disabled}>
            </div>
        """.format(
            id=html.escape("{0}-{1}".format(self.id, id), quote=True),
            label=html.escape(str(self.label), quote=True),
            classes=html.escape(self.input_classes(errors), quote=True),
            value=html.escape(str(value[id]), quote=True),
            disabled="disabled" if self.disabled else "",
        )

    def parse(self, data):
        value = {k: float(data["{0}-{1}".format(self.id, k)][0]) for k in ["lat", "lon"]}
        return {self.id: value}
