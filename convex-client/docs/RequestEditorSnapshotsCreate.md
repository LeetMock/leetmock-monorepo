# RequestEditorSnapshotsCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**ResponseActionsGetEditorSnapshotValue**](ResponseActionsGetEditorSnapshotValue.md) |  | 

## Example

```python
from convex_client.models.request_editor_snapshots_create import RequestEditorSnapshotsCreate

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEditorSnapshotsCreate from a JSON string
request_editor_snapshots_create_instance = RequestEditorSnapshotsCreate.from_json(json)
# print the JSON string representation of the object
print(RequestEditorSnapshotsCreate.to_json())

# convert the object into a dict
request_editor_snapshots_create_dict = request_editor_snapshots_create_instance.to_dict()
# create an instance of RequestEditorSnapshotsCreate from a dict
request_editor_snapshots_create_from_dict = RequestEditorSnapshotsCreate.from_dict(request_editor_snapshots_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


