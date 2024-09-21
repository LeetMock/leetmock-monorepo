# RequestAdminsCreateUserProfileArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**role** | [**RequestInviteCodesCreateInviteCodeArgsAssignedRole**](RequestInviteCodesCreateInviteCodeArgsAssignedRole.md) |  | 

## Example

```python
from convex_client.models.request_admins_create_user_profile_args import RequestAdminsCreateUserProfileArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestAdminsCreateUserProfileArgs from a JSON string
request_admins_create_user_profile_args_instance = RequestAdminsCreateUserProfileArgs.from_json(json)
# print the JSON string representation of the object
print(RequestAdminsCreateUserProfileArgs.to_json())

# convert the object into a dict
request_admins_create_user_profile_args_dict = request_admins_create_user_profile_args_instance.to_dict()
# create an instance of RequestAdminsCreateUserProfileArgs from a dict
request_admins_create_user_profile_args_from_dict = RequestAdminsCreateUserProfileArgs.from_dict(request_admins_create_user_profile_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


