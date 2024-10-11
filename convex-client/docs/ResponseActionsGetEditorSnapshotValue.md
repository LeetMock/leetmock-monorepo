# ResponseActionsGetEditorSnapshotValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**editor** | [**ResponseActionsGetEditorSnapshotValueEditor**](ResponseActionsGetEditorSnapshotValueEditor.md) |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**terminal** | [**ResponseActionsGetEditorSnapshotValueTerminal**](ResponseActionsGetEditorSnapshotValueTerminal.md) |  | 

## Example

```python
from convex_client.models.response_actions_get_editor_snapshot_value import ResponseActionsGetEditorSnapshotValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGetEditorSnapshotValue from a JSON string
response_actions_get_editor_snapshot_value_instance = ResponseActionsGetEditorSnapshotValue.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGetEditorSnapshotValue.to_json())

# convert the object into a dict
response_actions_get_editor_snapshot_value_dict = response_actions_get_editor_snapshot_value_instance.to_dict()
# create an instance of ResponseActionsGetEditorSnapshotValue from a dict
response_actions_get_editor_snapshot_value_from_dict = ResponseActionsGetEditorSnapshotValue.from_dict(response_actions_get_editor_snapshot_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


