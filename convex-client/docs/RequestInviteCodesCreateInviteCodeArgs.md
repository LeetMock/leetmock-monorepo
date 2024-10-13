# RequestInviteCodesCreateInviteCodeArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**assigned_role** | [**RequestAdminsCreateUserProfileArgsRole**](RequestAdminsCreateUserProfileArgsRole.md) |  | 

## Example

```python
from convex_client.models.request_invite_codes_create_invite_code_args import RequestInviteCodesCreateInviteCodeArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestInviteCodesCreateInviteCodeArgs from a JSON string
request_invite_codes_create_invite_code_args_instance = RequestInviteCodesCreateInviteCodeArgs.from_json(json)
# print the JSON string representation of the object
print(RequestInviteCodesCreateInviteCodeArgs.to_json())

# convert the object into a dict
request_invite_codes_create_invite_code_args_dict = request_invite_codes_create_invite_code_args_instance.to_dict()
# create an instance of RequestInviteCodesCreateInviteCodeArgs from a dict
request_invite_codes_create_invite_code_args_from_dict = RequestInviteCodesCreateInviteCodeArgs.from_dict(request_invite_codes_create_invite_code_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


