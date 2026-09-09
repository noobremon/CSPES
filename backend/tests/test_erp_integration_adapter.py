"""
Tests for Enterprise ERP & SAP Integration Adapter Interface.
"""

import pytest
from app.services.erp_adapter import (
    BaseERPAdapter,
    FileFeedERPAdapter,
    MockSAPConnectorAdapter,
    ERPConnectorType,
    ERPConnectionStatus,
    get_erp_adapter,
)


def test_file_feed_erp_adapter_csv():
    sample_csv = b"material_code,material_description,uom,category_code\nMAT-001,GATE VALVE 50MM CL150,EA,VALVE\n"
    adapter = get_erp_adapter(
        source_system_id="src-001",
        organization_code="IOCL",
        connector_type=ERPConnectorType.CSV_FILE_FEED,
        file_bytes=sample_csv
    )
    status, msg = adapter.check_connection()
    assert status == ERPConnectionStatus.READY

    extract_res = adapter.extract_material_catalog(batch_size=10)
    assert extract_res.extracted_records_count == 1
    assert extract_res.raw_payloads[0]["material_code"] == "MAT-001"
    assert extract_res.is_simulation is False

    export_res = adapter.export_cnmc_crosswalk([{"local_code": "MAT-001", "cnmc": "IN-IND-MECH-VLV-00001"}])
    assert export_res["success"] is True


def test_mock_sap_connector_adapter():
    adapter = get_erp_adapter(
        source_system_id="src-sap-002",
        organization_code="ONGC",
        connector_type=ERPConnectorType.SAP_RFC_BAPI
    )
    status, msg = adapter.check_connection()
    assert status == ERPConnectionStatus.SIMULATED_DEV
    assert "Simulation Mode" in msg

    extract_res = adapter.extract_material_catalog(batch_size=5)
    assert extract_res.extracted_records_count > 0
    assert extract_res.is_simulation is True
    assert "MARA" in str(extract_res.raw_payloads[0]["source_payload"])

    export_res = adapter.export_cnmc_crosswalk([{"local_code": "SAP-ONGC-1000", "cnmc": "IN-IND-MECH-VLV-00002"}])
    assert export_res["success"] is True
    assert export_res["target_system"] == "SAP_S4HANA_SIMULATED"
