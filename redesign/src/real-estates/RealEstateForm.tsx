import {Form, Formik} from "formik";
import * as Yup from "yup";
import {allFurnishing, allRealEstateCostTypes} from "../../../shared/constants/real-estate";
import {ApiEnergyEfficiency, ApiRealEstateCostType, ApiRealEstateListing} from "../../../shared/types/real-estate";
import Input from "../components/Input";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import React from "react";

export interface RealEstateFormProps {
    formId: string;
    onSubmit: (values: any) => any;
    realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateForm: React.FunctionComponent<RealEstateFormProps> =
    ({realEstate, onSubmit, formId}) => {

        const furnishing = {} as any;
        (realEstate?.characteristics?.furnishing || []).map(f => furnishing[f] = true);

        return (
            <Formik
                initialValues={{
                    name: realEstate?.name,
                    address: realEstate?.address,
                    price: realEstate?.costStructure?.price?.amount || 0,
                    type: realEstate?.costStructure?.type || ApiRealEstateCostType.RENT_MONTHLY_COLD,
                    realEstateSizeInSquareMeters: realEstate.characteristics?.realEstateSizeInSquareMeters || 0,
                    propertySizeInSquareMeters: realEstate.characteristics?.propertySizeInSquareMeters || 0,
                    energyEfficiency: realEstate.characteristics?.energyEfficiency || "A",
                    ...furnishing
                }}
                enableReinitialize={true}
                validationSchema={Yup.object({
                    name: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
                    address: Yup.string().required("Bitte geben Sie eine Adresse an"),
                    price: Yup.number(),
                    type: Yup.string(),
                    realEstateSizeInSquareMeters: Yup.number(),
                    propertySizeInSquareMeters: Yup.number(),
                    energyEfficiency: Yup.string(),
                })}
                onSubmit={onSubmit}
            >
                <Form id={formId}>
                    <div className="form-control">
                        <Input
                            label="Objektname"
                            name="name"
                            type="text"
                            placeholder="Objektname eingeben"
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="form-control">
                        <Input
                            label="Adressse"
                            name="address"
                            type="text"
                            placeholder="Adresse eingeben"
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="form-control flex-1">
                            <Input
                                label="Preis (€)"
                                name="price"
                                type="number"
                                placeholder="Preis eingeben"
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div className="form-control flex-1">
                            <Select
                                label="Kostenart"
                                name="type"
                                type="number"
                                placeholder="Kostenart eingeben"
                            >
                                {allRealEstateCostTypes.map((costType) => (
                                    <option value={costType.type} key={costType.type}>{costType.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="form-control flex-1">
                            <Input
                                label="Größe in Quadratmeer"
                                name="realEstateSizeInSquareMeters"
                                type="number"
                                placeholder="Größe in Quadrameter"
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div className="form-control flex-1">
                            <Input
                                label="Grundstück in Quadratmeer"
                                name="propertySizeInSquareMeters"
                                type="number"
                                placeholder="Grundstück in Quadrameter"
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>
                    <div className="form-control">
                        <Select
                            label="Energieeffizienklasse"
                            name="energyEfficiency"
                            placeholder="Energieeffizienzklasse"
                        >
                            {Object.keys(ApiEnergyEfficiency).map((aee) => (
                                <option value={aee} key={aee}>{aee}</option>
                            ))}
                        </Select>
                    </div>
                    <label className="label mt-4">
            <span className="label-text">
              <strong>Ausstattung</strong>
            </span>
                    </label>
                    {allFurnishing.map((furnishing) => (
                        <Checkbox name={furnishing.type} key={furnishing.type}>{furnishing.label}</Checkbox>
                    ))}
                </Form>
            </Formik>
        );
    };

export default RealEstateForm;
